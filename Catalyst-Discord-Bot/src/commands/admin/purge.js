const logger = require('@mirasaki/logger');

const MS_IN_TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;

module.exports = {
  data: {
    description: 'Purge a text channel',
    options: [
      {
        name: 'channel',
        description: 'The channel to purge',
        type: 7, // CHANNEL
        required: true,
        channel_types: [
          0, // 'GUILD_TEXT',
          5, // 'GUILD_NEWS',
          10, // 'GUILD_NEWS_THREAD',
          11, // 'GUILD_PUBLIC_THREAD',
          12 // 'GUILD_PRIVATE_THREAD'
        ]
      },
      {
        name: 'confirmation',
        description: 'Are you absolutely sure? Type "yes"',
        type: 3, // STRING
        required: true
      }
    ]
  },

  config: {
    permLevel: 'Administrator'
  },

  // eslint-disable-next-line sonarjs/cognitive-complexity
  run: async ({ client, interaction }) => {
    // Destructure
    const { member, options, channel } = interaction;
    const { emojis } = client.container;
    const targetChannel = options.getChannel('channel');
    const cmdConfirmationPrompt = options.getString('confirmation');
    const timestampTwoWeeksAgo = Date.now() - MS_IN_TWO_WEEKS;
    let lastMessageId = interaction.id;
    const { messages } = targetChannel;

    // Check initial confirmation
    if (cmdConfirmationPrompt !== 'yes') {
      interaction.reply({
        content: `${emojis.error} ${member}, you didn't reply with \`yes\` to the confirmation prompt. This command has been cancelled, ${targetChannel} **didn't** get purged.`
      });
      return;
    }

    // Defer our reply
    await interaction.deferReply();

    // Second confirmation
    const confirmMsg = await channel.send({
      content: `${emojis.wait} ${member}, **Second Confirmation** - are you __absolutely__ sure you want to wipe/purge ${targetChannel}? Reply with **\`yes\`**.`
    });

    // Creating a message collector
    // requires GuildMessages and MessageContent intent
    const collector = channel.createMessageCollector({
      filter: (m) => m.author.id === member.id,
      max: 1,
      time: 60_000
    });

    collector.on('collect', async (m) => {
      // Delete stuff regardless
      try {
        await confirmMsg.delete();
        await m.delete();
      } catch {
        // That's fine =)
      }

      // Second confirmation
      if (m.content !== 'yes') {
        await interaction.editReply({
          content: `${emojis.error} ${member}, **Second Confirmation** wasn't accepted. This command has been cancelled, ${targetChannel} **didn't** get purged.`
        });
        return;
      }

      // Looping, deleting every message thats newer than 2 weeks old
      let totalDeletedCount = 0;
      let lastMessageCreatedTs = Date.now();
      do {

        // Fetch our messages
        let targetMessages;
        try {
          targetMessages = await messages.fetch({
            cache: false,
            force: false,
            before: lastMessageId
          });
        } catch (err) {
          logger.syserr('Error encountered while fetching messages to purge');
          logger.printErr(err);
          await interaction.editReply({
            content: `${emojis.error} ${member}, something went wrong while fetching messages in ${targetChannel}. Click block below to reveal:\n\n||${err.stack || err}||`
          });
          return;
        }

        // Filtering out messages older than 2 weeks
        const validMessages = targetMessages.filter(
          (msg) => msg.createdTimestamp > timestampTwoWeeksAgo
          && msg.id !== undefined && typeof msg.id !== 'undefined'
        );

        // Assigning our first and last message from the collection
        const lastMessage = validMessages.last();

        // Overwriting our variables
        lastMessageCreatedTs = lastMessage?.createdTimestamp || timestampTwoWeeksAgo;
        lastMessageId = lastMessage?.id;

        try {
        // Waiting until the 50 messages are deleted
          await interaction.editReply({
            content: (
            // Reached end of valid messages?
              validMessages.size !== targetMessages.size
                ? `${emojis.info} ${member}, fetched \`${targetMessages.size}\` messages, but only \`${validMessages.size}\` can be deleted. ${targetMessages.size - validMessages.size} are older than 2 weeks and can't be deleted by bots.\n${emojis.wait} Deleting final batch...`
                : `${emojis.success} ${member}, deleting \`${validMessages.size}\` messages...\nLast message timestamp: ${lastMessage?.createdAt || new Date(timestampTwoWeeksAgo)}`
            )
          });

          // Increasing count and deleting valid messages
          totalDeletedCount += validMessages.size;
          await targetChannel.bulkDelete(validMessages);
        } catch (err) {
          await interaction.editReply({
            content: `${emojis.error} ${member}, something went wrong, click blow below to reveal error:\n\n||${err.stack || err}||`
          });
          return;
        }
      } while (lastMessageCreatedTs > timestampTwoWeeksAgo);

      // Finishing up, user feedbac;
      await interaction.editReply({
        content: `${emojis.success} ${member}, all done - deleted a total of ${totalDeletedCount} messages\nThis message will be deleted in **\`5 seconds\`**`
      });

      setTimeout(async () => {
        interaction.deleteReply().catch(() => {
        // Already deleted by user - continue
        });
      }, 1000 * 5);

    });
  }
};
