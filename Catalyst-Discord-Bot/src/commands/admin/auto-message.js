/* eslint-disable sonarjs/no-nested-template-literals */
const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const uuid = require('uuid');
const { v4: uuidv4 } = uuid;

// Initializing our cache map
const autoMessageCache = new Map();

// Destructure from env
const {
  DEBUG_AUTO_MESSAGE
} = process.env;

// Defining our clean-up function
const updateAutoMessage = async (taskUID, channel, taskOutput) => {
  const debugTag = chalk.magenta(`[${taskUID}]`);
  // Fetching all messages in the channel
  let messages;
  try {
    messages = await channel.messages?.fetch();
  } catch (err) {
    logger.syserr(`${debugTag} Error encountered while fetching messages from <#${channel.name}>`);
    logger.printErr(err);
  }

  // Early return statement
  if (!messages) {
    return true;
  }

  // Check if the last message is our auto-message
  if (messages.first().content === taskOutput) {
    // Debug logging
    if (DEBUG_AUTO_MESSAGE === 'true') {
      logger.debug(`${debugTag} skipping auto-message update, auto-message is last channel message`);
    }
    return true;
  }

  // Finding our most recent task message
  const taskMessage = messages.find((msg) => msg.content === taskOutput);

  // Delete the previousTaskMessage
  taskMessage?.delete()
    .catch(() => {
      // No permission to delete or too old
      // Continue
    });

  // Additional debug logging
  if (DEBUG_AUTO_MESSAGE === 'true') {
    logger.debug(`${debugTag} Sending auto-message in ${chalk.green(channel.name)} with content: ${chalk.grey(taskOutput)}`);
  }
  // Sending the message to the target channel
  channel
    .send(taskOutput)
    .catch(() => {
      // Missing permissions
      logger.syserr(`Missing permissions to send auto-message in #${channel.name}`);
    });
};

module.exports = {
  // Building our API data
  data: {
    description: 'Manage auto-message functionality',
    options: [
      {
        name: 'action',
        type: 2, // SUB_COMMAND_GROUP
        description: 'Enable or disable auto-message functionality',
        options: [
          {
            name: 'enable',
            type: 1, // SUB_COMMAND
            description: 'Enable auto-messaging',
            options: [
              {
                name: 'channel',
                type: 7, // CHANNEL
                description: 'The channel to enable auto-messaging in',
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
                name: 'duration',
                type: 4, // INTEGER
                description: 'The amount of time in MINUTES this auto-message should be active for',
                required: true,
                min_value: 1,
                // 32-bit signed integer max = 2147483647 in ms
                max_value: 35791
              },
              {
                name: 'interval',
                type: 4, // INTEGER
                description: 'The time between messages in SECONDS',
                required: true,
                min_value: 5
              },
              {
                name: 'message',
                type: 3, // STRING
                description: 'The message to send',
                required: true
              }
            ]
          },
          {
            name: 'disable',
            type: 1, // SUB_COMMAND
            description: 'Disable auto-messaging',
            options: [
              {
                name: 'channel',
                type: 7, // CHANNEL
                description: 'The channel to disable auto-messaging in',
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
                name: 'message',
                type: 3, // STRING
                description: 'The message to send',
                required: true
              }
            ]
          }
        ]
      }
    ]
  },

  // Setting our required permission level
  config: {
    permLevel: 'Administrator',
    userPerms: ['ManageMessages', 'ManageChannels']
  },

  // Runs when command is called
  run: ({ client, interaction }) => {
    // Destructuring
    const { member, options } = interaction;
    const { emojis } = client.container;

    // Assigning our variables
    // Always present/available
    const subCommand = options.getSubcommand('action');
    const targetChannel = options.getChannel('channel');
    const message = options.getString('message');

    switch (subCommand) {
      case 'enable': {
        // More assignments
        const taskUID = uuidv4();
        const debugTag = chalk.magenta(`[${taskUID}]`);
        // We grab the time in ms instead
        const intervalMS = options.getInteger('interval') * 1000;
        const durationMinutes = options.getInteger('duration');

        // Debug logging
        if (DEBUG_AUTO_MESSAGE === 'true') {
          logger.debug(`${debugTag} Starting auto-message in ${chalk.greenBright(targetChannel.name)}, running every ${chalk.yellow(intervalMS / 1000)} seconds for ${chalk.yellow(durationMinutes)} minutes.`);
        }

        // Defining our interval
        const autoMessageInterval = setInterval(() => {
          updateAutoMessage(taskUID, targetChannel, message);
        }, intervalMS);

        // Defining our timeout
        const autoMessageTimeout = setTimeout(() => {
          clearInterval(autoMessageInterval);
          autoMessageCache.delete(taskUID);
        }, durationMinutes * 60 * 1000);

        // Additional CONDITIONAL debug logging
        if (DEBUG_AUTO_MESSAGE === 'true') {
          logger.debug(`${debugTag} Assigned interval ID ${chalk.cyan(autoMessageInterval)} and timeout ID ${chalk.cyan(autoMessageTimeout)} to created auto-message task`);
        }

        // Creating our cache entry for early disable
        autoMessageCache.set(
          taskUID,
          {
            channel: targetChannel.id,
            message,
            durationMS: durationMinutes * 60 * 1000,
            intervalMS,
            interval: autoMessageInterval,
            timeout: autoMessageTimeout
          }
        );

        // Sending user feedback
        interaction.reply({
          content: `${emojis.success} ${member}, task **\`${taskUID}\`** scheduled. Running every ${intervalMS / 1000} seconds for a total of ${durationMinutes} minutes.`
        });
        break;
      }

      // On disable and default
      case 'disable':
      default: {
        // Assigning variables
        // Spreading our Map in an array to find() and filter()
        const cachedTasks = [...autoMessageCache];
        const taskExists = cachedTasks.find(([uid, { channel: channelId, message: taskMessage }]) => taskMessage === message && channelId === targetChannel.id);

        // Check if task exists
        if (!taskExists) {
          interaction.reply({
            content: `${emojis.error} ${member}, couldn't find a task matching that criteria.`
          });
          return;
        }

        // Destructure from our existing task
        const [taskUID, stats] = taskExists;

        // Cancelling the tasks early
        clearInterval(stats.interval);
        clearTimeout(stats.timeout);
        autoMessageCache.delete(taskUID);

        // Additional CONDITIONAL debug logging
        if (DEBUG_AUTO_MESSAGE === 'true') {
          logger.debug(`${chalk.magenta(`[${taskUID}]`)} Cancelled task that ran every ${stats.intervalMS / 1000} seconds for a total of ${stats.durationMS / 1000} seconds. Content: ${stats.message}`);
        }

        // User feedback
        interaction.reply({
          content: `${emojis.success} ${member}, cancelled task **\`${taskUID}\`**.\nChannel: <#${stats.channel}>\nDuration: ${stats.durationMS / 1000} seconds\nInterval: ${stats.intervalMS / 1000}`
        });
        break;
      }
    }
  }

};
