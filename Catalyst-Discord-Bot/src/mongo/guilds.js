const { Schema, model } = require('mongoose');

const guildSchema = Schema({
  id: { type: String, required: true, unique: true },
  dailyGiveawayActive: { type: Boolean, default: true },
  weeklyGiveawayActive: { type: Boolean, default: true }
});

const getSettings = async (guildId) => {
  let guildSettings = await GuildModel.findOne({ id: guildId });
  if (!guildSettings) {
    guildSettings = new GuildModel({ id: guildId });
    await guildSettings.save();
  }
  return guildSettings;
};

const GuildModel = model('Guild', guildSchema);
module.exports.GuildModel = GuildModel;
module.exports.getSettings = getSettings;
