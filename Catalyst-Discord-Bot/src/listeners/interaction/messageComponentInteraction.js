/* eslint-disable sonarjs/no-nested-template-literals */
const logger = require('@mirasaki/logger');
const { hasChannelPerms } = require('../../handlers/permissions');
const colors = require('../../../config/colors.json');
const emojis = require('../../../config/emojis.json');
const { colorResolver } = require('../../util');
const { SuggestionModel } = require('../../mongo/suggestion');
const { GiveawayModel } = require('../../mongo/giveaways');
const { getDailyGiveawayIdentifier, getWeeklyGiveawayIdentifier } = require('../../modules/giveaways');

// eslint-disable-next-line sonarjs/cognitive-complexity
module.exports = async (client, interaction) => {
  const { member, channel, message } = interaction;
  const hasAdmin = hasChannelPerms(member.id, channel, ['Administrator']) === true;

  switch (interaction.customId) {
    case 'create_suggestion': {
      await interaction.showModal({
        title: 'Make a suggestion',
        custom_id: 'create_suggestion_modal',
        components: [
          {
            type: 1, // Action Row
            components: [
              {
                type: 4, // Text Input
                custom_id: 'name_input',
                label: 'Title',
                style: 1, // Single Line
                min_length: 10,
                max_length: 1000,
                placeholder: 'Give your suggestion a meaningful title',
                required: true
              }
            ]
          },
          {
            type: 1, // Action Row
            components: [
              {
                type: 4, // Text Input
                custom_id: 'description_input',
                label: 'Description',
                style: 2, // Paragraph / Multi Line
                min_length: 10,
                max_length: 1000,
                placeholder: 'Describe your suggestion',
                required: true
              }
            ]
          }
        ]
      });
      break;
    }

    case 'upvote_suggestion': {
      // Fetching our data
      const originalEmbed = message.embeds[0];
      const uid = originalEmbed.footer.text.split('\n')[
        originalEmbed.footer.text.split('\n').length - 1
      ];
      const data = await SuggestionModel.findOne({ _id: uid });

      // Check has voted
      if (data.upvote.includes(member.id) || data.downvote.includes(member.id)) {
        interaction.reply({
          content: `${emojis.error} ${member}, you have already voted for this suggestion.`,
          ephemeral: true
        });
        return;
      }


      // Creating the new embed
      const { title, footer, description, author } = originalEmbed;
      const [ upvoteStr, downvoteStr, empty, uidStr ] = footer.text.split('\n');
      const currentUpvotes = Number(upvoteStr.split(' ')[upvoteStr.split(' ').length - 1]);
      const acceptedEmbed = {
        color: colorResolver(colors.green),
        author,
        title: title,
        description,
        footer: {
          text: `👍 Upvotes: ${currentUpvotes + 1}\n${downvoteStr}\n${empty}\n${uidStr}`
        }
      };

      // Edit current votes
      await message.edit({
        embeds: [acceptedEmbed]
      });

      // Reply success
      await interaction.reply({
        content: `${emojis.success} ${member}, your vote has been registered`,
        ephemeral: true
      });

      // Saving their data
      data.upvote.push(member.id);
      await data.save();
      break;
    }

    case 'downvote_suggestion': {
      // Fetching our data
      const originalEmbed = message.embeds[0];
      const uid = originalEmbed.footer.text.split('\n')[
        originalEmbed.footer.text.split('\n').length - 1
      ];
      const data = await SuggestionModel.findOne({ _id: uid });

      // Check has voted
      if (data.upvote.includes(member.id) || data.downvote.includes(member.id)) {
        interaction.reply({
          content: `${emojis.error} ${member}, you have already voted for this suggestion.`,
          ephemeral: true
        });
        return;
      }

      // Creating the new embed
      const { title, footer, description, author } = originalEmbed;
      const [ upvoteStr, downvoteStr, empty, uidStr ] = footer.text.split('\n');
      const currentDownvotes = Number(downvoteStr.split(' ')[downvoteStr.split(' ').length - 1]);
      const acceptedEmbed = {
        color: colorResolver(colors.green),
        author,
        title: title,
        description,
        footer: {
          text: `${upvoteStr}\n👎 Downvotes: ${currentDownvotes + 1}\n${empty}\n${uidStr}`
        }
      };

      // Edit current votes
      await message.edit({
        embeds: [acceptedEmbed]
      });

      // Reply success
      await interaction.reply({
        content: `${emojis.success} ${member}, your vote has been registered`,
        ephemeral: true
      });

      // Saving their data
      data.downvote.push(member.id);
      await data.save();
      break;
    }

    case 'accept_suggestion': {
      // Check admin
      if (!hasAdmin) {
        interaction.reply({
          content: `${emojis.error} ${member}, you don't have permission to accept this suggestion`,
          ephemeral: true
        });
        return;
      }

      // Fetching our data
      const originalEmbed = message.embeds[0];
      // const uid = originalEmbed.footer.text.split('\n')[
      //   originalEmbed.footer.text.split('\n').length - 1
      // ];
      // const data = await SuggestionModel.findOne({ _id: uid });

      // Creating the new embed
      const { title, footer, description, author } = originalEmbed;
      const acceptedEmbed = {
        color: colorResolver(colors.green),
        author,
        title: `Accepted: ${title}`,
        description: `${description}\n\nAccepted: <t:${Math.round(Date.now() / 1000)}:f> by ${member}`,
        // fields: [
        //   {
        //     name: 'Upvoted by:',
        //     value: `${data.upvote[0] ? data.upvote.map(id => `<@!${id}>`).join('\n') : 'No one'}`,
        //     inline: true
        //   },
        //   {
        //     name: 'Downvoted by:',
        //     value: `${data.downvote[0] ? data.downvote.map(id => `<@!${id}>`).join('\n') : 'No one'}`,
        //     inline: true
        //   }
        // ],
        footer
      };

      // Close the suggestion
      await message.edit({
        embeds: [acceptedEmbed],
        components: []
      });
      break;
    }

    case 'decline_suggestion': {
      // Check admin
      if (!hasAdmin) {
        interaction.reply({
          content: `${emojis.error} ${member}, you don't have permission to decline this suggestion`,
          ephemeral: true
        });
        return;
      }

      // Fetching our data
      const originalEmbed = message.embeds[0];
      // const uid = originalEmbed.footer.text.split('\n')[
      //   originalEmbed.footer.text.split('\n').length - 1
      // ];
      // const data = await SuggestionModel.findOne({ _id: uid });

      // Creating the new embed
      const { title, footer, description, author } = originalEmbed;
      const declinedEmbed = {
        color: colorResolver(colors.red),
        author,
        title: `Declined: ${title}`,
        description: `${description}\n\nDeclined: <t:${Math.round(Date.now() / 1000)}:f> by ${member}`,
        // fields: [
        //   {
        //     name: 'Upvoted by:',
        //     value: `${data.upvote[0] ? data.upvote.map(id => `<@!${id}>`).join('\n') : 'No one'}`,
        //     inline: true
        //   },
        //   {
        //     name: 'Downvoted by:',
        //     value: `${data.downvote[0] ? data.downvote.map(id => `<@!${id}>`).join('\n') : 'No one'}`,
        //     inline: true
        //   }
        // ],
        footer
      };

      // Close the suggestion
      await message.edit({
        embeds: [declinedEmbed],
        components: []
      });
      break;
    }

    case 'giveaway_join_daily': {
      await interaction.deferReply({ ephemeral: true });

      const dateId = getDailyGiveawayIdentifier(new Date());
      const data = await GiveawayModel.findOne({ data: dateId, type: 'daily' });

      if (!data) {
        interaction.editReply({
          content: `${emojis.error} ${member}, couldn't find relevant database data. Please try again later.`
        });
        return;
      }

      const { entered } = data;

      if (entered.includes(member.id)) {
        interaction.editReply({
          content: `${emojis.error} ${member}, you have already entered this giveaway.`
        });
        return;
      }

      entered.push(member.id);
      data.markModified('entered');
      await data.save();

      interaction.editReply({
        content: `${emojis.success} ${member}, you have now entered the giveaway`
      });

      break;
    }

    case 'giveaway_join_weekly': {
      await interaction.deferReply({ ephemeral: true });

      const dateId = getWeeklyGiveawayIdentifier(new Date());
      const data = await GiveawayModel.findOne({ data: dateId, type: 'weekly' });

      if (!data) {
        interaction.editReply({
          content: `${emojis.error} ${member}, couldn't find relevant database data. Please try again later.`
        });
        return;
      }

      const { entered } = data;

      if (entered.includes(member.id)) {
        interaction.editReply({
          content: `${emojis.error} ${member}, you have already entered this giveaway.`
        });
        return;
      }

      entered.push(member.id);
      data.markModified('entered');
      await data.save();

      interaction.editReply({
        content: `${emojis.success} ${member}, you have now entered the giveaway`
      });

      break;
    }

    default: {
      logger.debug(`Unknown button interaction received: ${interaction.customId}`);
    }
  }
};
