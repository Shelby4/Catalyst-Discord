const { getFiles, titleCase } = require('../../util');
const path = require('path');
const fs = require('fs/promises');
const logger = require('@mirasaki/logger');
const { stripIndents } = require('common-tags/lib');
const TXT_FILE_EXTENSION_LENGTH = 4;

// Mapping our available lists/groups
const allLists = getFiles(path.join('config', 'guess'), 'txt')
  .map((cfgPath) => {
    const pathArr = cfgPath.split(path.sep);
    const listFileName = pathArr[pathArr.length - 1];
    return listFileName.slice(0, -TXT_FILE_EXTENSION_LENGTH);
  });

// Utility function to wait
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

module.exports = {
  // Discord API interaction data
  data: {
    description: 'Start a guessing game',
    options: [
      {
        type: 3, // STRING
        required: true,
        name: 'list',
        description: 'Select the list to pick a random value from',
        choices: allLists.map((list) => ({ name: list, value: list }))
      },
      {
        type: 7, // CHANNEL
        required: true,
        name: 'channel',
        description: 'Select the channel where the bot will listen for guesses',
        channel_types: [
          0, // 'GUILD_TEXT',
          5, // 'GUILD_NEWS',
          10, // 'GUILD_NEWS_THREAD',
          11, // 'GUILD_PUBLIC_THREAD',
          12 // 'GUILD_PRIVATE_THREAD'
        ]
      },
      {
        type: 4, // INTEGER
        required: true,
        name: 'duration',
        description: 'The amount of time in MINUTES the game will be active for',
        min_value: 1,
        // 32-bit signed integer max = 2147483647 in ms
        max_value: 35791
      },
      {
        type: 3, // STRING
        required: false,
        name: 'prize',
        description: '(optional) Provide a prize for the winner'
      }
    ]
  },

  run: async ({ client, interaction }) => {
    // Destructuring and assignments
    const { member, options } = interaction;
    const { emojis } = client.container;
    const listName = options.getString('list');
    const targetChannel = options.getChannel('channel');
    const gameDuration = options.getInteger('duration');
    const gameDurationMs = gameDuration * 60 * 1000;
    const prize = options.getString('prize');
    const gameHasPrize = prize !== null;
    const listFilePath = path.join('config', 'guess', `${listName}.txt`);

    // Deferring our reply
    await interaction.deferReply({ ephemeral: true });

    // Reading our list/group config file
    let listConfig;
    try {
      listConfig = (await fs.readFile(listFilePath, 'utf-8')).toString();
    } catch (err) {
      logger.syserr('Encounter error while reading list config file');
      logger.printErr(err);
      interaction.editReply({
        content: `${emojis.error} ${member}, encounter an error while reading list config file, click block below to reveal:\n\n||${err.stack || err}||`
      });
      return;
    }

    // Grabbing our random item
    const listItemArr = listConfig
      .split('\n')
      .filter((entry) => entry.length >= 1);
    const randomItem = listItemArr[Math.floor(Math.random() * listItemArr.length)];

    // User feedback
    await interaction.editReply({
      content: `${emojis.wait} ${member}, grabbing random value from list **\`${listName}\`**, which has **${listItemArr.length}** possible values...`
    });

    // Waiting 1250 ms
    await sleep(1250);

    // Send game-started message
    const gameStartedMessage = await targetChannel.send({
      content: stripIndents`
        **A new guessing game just started!**
        *Category:* **${titleCase(listName.slice(0, -1))}**
        *Duration:* **${gameDuration} minutes**
        ${gameHasPrize ? `
          __*Prize:* **${prize}**__
        ` : ''}
      `
    });

    // Update command interaction reply
    interaction.editReply({
      content: `${emojis.wait} ${member}, the game has started!\nCorrect guess: ||**\`${randomItem}\`**||`
    });

    // Creating a message collector
    // requires GuildMessages and MessageContent intent
    const collector = targetChannel.createMessageCollector({
      time: gameDurationMs
    });

    let winner = undefined;
    const gameStart = Date.now();
    let gameEnd = undefined;

    // Collecting guesses
    collector.on('collect', async (m) => {
      // Assign check and return if incorrect
      const isCorrectGuess = m.content.toLowerCase() === `${randomItem.toLowerCase()}`;
      if (!isCorrectGuess) return;

      // Handle won / guessed correctly
      winner = m.author;
      gameEnd = Date.now();
      collector.stop('won');
    });

    // Collector has finished
    collector.on('end', async (collected, reason) => {
      // Update game started message
      await gameStartedMessage.edit({
        content: gameStartedMessage.content + `\n\n**__${emojis.error}__** This guessing game has expired.`
      });

      // Game has been won
      if (reason === 'won') {
        // Edit the original command reply
        await interaction.editReply({
          content: stripIndents`
            ${emojis.success} ${member}, the guessing game has finished!
            ${winner} has won the game after ${Math.ceil((gameEnd - gameStart) / 1000 / 60)} minutes and a combined total of ${collected.size} guesses.
            ${gameHasPrize ? `${winner} has won: **${prize}**` : ''}
          `
        });

        // Sending Follow-up in game channel
        targetChannel.send({
          content: stripIndents`
            ${emojis.success} This guessing game has finished!
            ${winner} has won the game after ${Math.ceil((gameEnd - gameStart) / 1000 / 60)} minutes and a combined total of ${collected.size} guesses.
            The correct guess was: **\`${randomItem}\`**
            ${gameHasPrize ? `${winner} has won: **${prize}**` : ''}
          `
        });
      }

      // Game expired
      else {
        // Edit the original command reply
        await interaction.editReply({
          content: stripIndents`
            ${emojis.error} ${member}, the guessing game has finished!
            No one has guessed the random value of ||**\`${randomItem}\`**||...
          `
        });

        // Sending Follow-up in game channel
        targetChannel.send({
          content: stripIndents`
            ${emojis.success} This guessing game has finished!
            No one has guessed the random value of ||**\`${randomItem}\`**||...
          `
        });
      }

    });
  }
};
