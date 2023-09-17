const { Schema, model } = require('mongoose');

const suggestionSchema = Schema({
  _id: { type: String, required: true },
  upvote: { type: Array, default: [] },
  downvote: { type: Array, default: [] }
});

const SuggestionModel = model('suggestion', suggestionSchema);
module.exports.SuggestionModel = SuggestionModel;
