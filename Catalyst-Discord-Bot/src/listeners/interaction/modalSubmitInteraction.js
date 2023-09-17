const { getSuggestionsChannel, sendStickyMessage } = require('../../modules/suggestions');
const { colorResolver } = require('../../util');
const colors = require('../../../config/colors.json');
const emojis = require('../../../config/emojis.json');

const { stripIndents } = require('common-tags/lib');

const uuid = require('uuid');
const { SuggestionModel } = require('../../mongo/suggestion');
const { v4: uuidv4 } = uuid;

module.exports = async (client, interaction) => {
  const { member } = interaction;

  // create_suggestion_modal
  if (interaction.customId === 'create_suggestion_modal') {
    const suggestionTitle = interaction.fields.getTextInputValue('name_input');
    const suggestionDescription = interaction.fields.getTextInputValue('description_input');
    const channel = await getSuggestionsChannel(client);
    const uid = uuidv4();

    // Sending the suggestion message
    const suggestionMsg = await channel.send({
      embeds: [
        {
          color: colorResolver(colors.orange),
          author: {
            name: member.displayName,
            icon_url: member.displayAvatarURL({ dynamic: true })
          },
          title: suggestionTitle,
          description: suggestionDescription,
          footer: {
            text: stripIndents`
              👍 Upvotes: 0
              👎 Downvotes: 0

              ${uid}
            `
          }
        }
      ],
      components: [
        // Accept & Deny
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              label: null,
              style: 2, // Secondary
              custom_id: 'accept_suggestion',
              emoji: {
                id: null,
                name: '✅'
              }
            },
            {
              type: 2, // Button
              label: null,
              style: 2, // Secondary
              custom_id: 'decline_suggestion',
              emoji: {
                id: null,
                name: '⛔'
              }
            }
          ]
        },
        // Upvote & Downvote
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              label: null,
              style: 2, // Secondary
              custom_id: 'upvote_suggestion',
              emoji: {
                id: null,
                name: '👍'
              }
            },
            {
              type: 2, // Button
              label: null,
              style: 2, // Secondary
              custom_id: 'downvote_suggestion',
              emoji: {
                id: null,
                name: '👎'
              }
            }
          ]
        }
      ]
    });

    // Creating the discussion thread
    suggestionMsg.startThread({
      name: `Discuss: ${suggestionTitle}`,
      reason: 'Automatically created by suggestion manager'
    })
      .catch((err) => {
        // Currently bugged in discord.js@dev
      });

    // Notifying successful
    await interaction.reply({
      content: `${emojis.success} ${member}, received your suggestion!`
    });

    // Creating our new data
    const newSuggestion = new SuggestionModel({ _id: uid });
    await newSuggestion.save();

    // Delete reply after 15 seconds
    setTimeout(() => {
      interaction.deleteReply();
    }, 1000 * 15);

    // Refresh our sticky message
    await sendStickyMessage(client);
  }
};
