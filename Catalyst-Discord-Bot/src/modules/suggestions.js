const logger = require('@mirasaki/logger');
const { stripIndents } = require('common-tags/lib');
const { colorResolver } = require('../util');

const STICKY_MESSAGE_TEXT = stripIndents`
  **To create a suggestion, __click the button below__**

  - __Everyone__ will be able to upvote or downvote.
  - __Everyone__ will be able to chat in the threads sharing their opinion.
  - __Staff__ will be able to accept or deny the suggestion.
`;

// Destructure from env
const {
  SUGGESTIONS_CHANNEL_ID
} = process.env;

// Get out suggestions channel
const getSuggestionsChannel = async (client) => {
  return await client.channels.fetch(SUGGESTIONS_CHANNEL_ID);
};

// Delete previous sticky messages
const removePreviousStickyMessages = async (client) => {
  const channel = await getSuggestionsChannel(client);

  // Catch no channel
  if (!channel) {
    logger.debug(`Unable to find suggestions channel: ${SUGGESTIONS_CHANNEL_ID}`);
    return;
  }

  // Fetching all messages in the channel
  let messages;
  try {
    messages = await channel.messages?.fetch();
  } catch (err) {
    logger.syserr(`Error encountered while fetching messages from <#${channel.name}>`);
    logger.printErr(err);
  }

  // Early return statement
  if (!messages) {
    return true;
  }

  // Filter our target messages
  const targetMessages = messages.filter((msg) => {
    const embed = msg.embeds[0];
    const isTargetMessage = (
      embed
      && embed.data?.description
      && embed.data.description === STICKY_MESSAGE_TEXT
    );
    return !!(isTargetMessage);
  });

  // Deleting all our sticky messages
  channel.bulkDelete(targetMessages);
};

// Send the sticky message in our suggestions channel
const sendStickyMessage = async (client) => {
  const channel = await getSuggestionsChannel(client);

  // Catch no channel
  if (!channel) {
    logger.debug(`Unable to send sticky suggestions message in channel ${SUGGESTIONS_CHANNEL_ID}`);
    return;
  }

  // Removing old messages first
  await removePreviousStickyMessages(client);

  // Sending the message
  channel.send({
    embeds: [
      {
        color: colorResolver(
          client.container.emojis.stickySuggestionsMsg
        ),
        description: STICKY_MESSAGE_TEXT
      }
    ],
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            label: 'New Suggestion',
            style: 1,
            custom_id: 'create_suggestion',
            emoji: {
              id: null,
              name: '➕'
            }
          }
        ]
      }
    ]
  });
};

module.exports = {
  sendStickyMessage,
  getSuggestionsChannel,
  removePreviousStickyMessages
};
