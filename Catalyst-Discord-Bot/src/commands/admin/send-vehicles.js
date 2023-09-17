const { updateVehicleChannel } = require('../../modules/vehicles');

module.exports = {
  // Building our API data
  data: {
    description: 'Send vehicle overview to the specified channel',
    default_permission: false,
    options: [
      {
        name: 'channel',
        description: 'The channel to send to',
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
    const { member } = interaction;
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

    // Defer reply
    await interaction.deferReply({ ephemeral: true });

    // Sending the vehicle stuff
    await updateVehicleChannel(channelInput, client);

    // User feedback
    interaction.editReply({
      content: `${emojis.success} ${member}, message delivered!`
    });
  }
};
