const { colorResolver } = require('../../util');

module.exports = {
  // Building our API data
  data: {
    description: 'Send guide to the specified channel',
    default_permission: false,
    options: [
      {
        name: 'channel',
        description: 'The channel to send the guide to',
        type: 7, // is CHANNEL type
        // Specifying our channel types
        channel_types: [
          0, // 'GUILD_TEXT',
          5, // 'GUILD_NEWS',
          10, // 'GUILD_NEWS_THREAD',
          11, // 'GUILD_PUBLIC_THREAD',
          12 // 'GUILD_PRIVATE_THREAD'
        ],
        required: true
      }
    ]
  },

  // Setting our command permission level
  config: {
    permLevel: 'Administrator',
    clientPerms: ['EmbedLinks', 'ViewChannel']
  },

  // Runs on command interaction
  run: async ({ client, interaction }) => {
    // Destructuring
    const { member, guild } = interaction;
    const { emojis } = client.container;

    // Getting our variables
    const channelInput = interaction.options.getChannel('channel');

    // No channel fallback
    if (!channelInput) {
      interaction.reply({
        content: `${emojis} ${member}, couldn't fetch specified channel, please try again.`
      });
      return;
    }

    // Grabbing and converting our rules
    const pathToRulesJSON = '../../../config/guide-armor-vest.json';
    delete require.cache[require.resolve(pathToRulesJSON)];
    const rules = require(pathToRulesJSON).map((rule) => `> ${rule}`);
    const ruleStr = rules.join('\n');

    // Building our rule embed
    const embedData = {
      color: colorResolver(),
      title: `ARMOR SYSTEM VEST`,
      description: ruleStr,
      image: {
        url: 'https://imgur.com/Lmi9BJR.png',
      },
    };

    // Deferring our reply
    await interaction.deferReply({ ephemeral: true });

    // Sending the rule message to the specified channel
    let rulesMsg;
    try {
      // Possible errors are bound to be permissions
      rulesMsg = await channelInput.send({
        embeds: [
          embedData
        ]
      });
    } catch (err) {
      // Handling our error
      interaction.editReply({
        content: `${emojis.error} ${member}, something went wrong while sending the embed data to ${channelInput} - are you sure I have the 'Send Messages' and 'Embed Links' permission in that channel?\nClick the block below to reveal the error:\n\n||${err.stack || err}||`
      });
      return;
    }

    // User feedback
    interaction.editReply({
      content: `${emojis.success} ${member}, message delivered!\n\n${rulesMsg.url}`
    });
  }
};
