const { Schema, model } = require('mongoose');

const giveawaySchema = Schema({
  date: { type: String, required: true, unique: true },
  type: { type: String, default: 'daily' },
  prize: { type: Array, default: [] },
  entered: { type: Array, default: [] },
  messageId: { type: String, required: true }
});

const GiveawayModel = model('Giveaway', giveawaySchema);
module.exports.GiveawayModel = GiveawayModel;
