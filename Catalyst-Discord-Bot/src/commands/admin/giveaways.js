const { getSettings } = require('../../mongo/guilds');

module.exports = {
  data: {
    description: 'Disable or enable giveaways',
    options: [
      {
        type: 3, // String
        name: 'type',
        description: 'Manage daily or weekly giveaways?',
        required: true,
        choices: [
          { name: 'daily', value: 'daily' },
          { name: 'weekly', value: 'weekly' }
        ]
      },
      {
        type: 5, // BOOLEAN
        name: 'status',
        description: 'Should the giveaway be enabled?',
        required: true
      }
    ]
  },

  run: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });
    const { member, guild, options } = interaction;
    const { emojis } = client.container;
    const type = options.getString('type');
    const status = options.getBoolean('status');
    const settings = await getSettings(guild.id);

    if (type === 'daily') settings.dailyGiveawayActive = status;
    else settings.weeklyGiveawayActive = status;

    await settings.save();

    interaction.editReply({
      content: `${emojis.success} ${member}, ${type} giveaway is now ${status === true ? 'enabled' : 'disabled'}`
    });
  }
};
