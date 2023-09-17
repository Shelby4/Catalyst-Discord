const GIVEAWAY_LABEL_JOIN = 'Join Giveaway';
const GIVEAWAY_TAG_DAILY = '[Daily Giveaway]';
const GIVEAWAY_TAG_WEEKLY = '[Weekly Giveaway]';
const GIVEAWAY_TYPE_DAILY = 'daily';
const GIVEAWAY_TYPE_WEEKLY = 'weekly';

const DAILY_GIVEAWAY_BUTTON_JOIN_ID = 'giveaway_join_daily';
const WEEKLY_GIVEAWAY_BUTTON_JOIN_ID = 'giveaway_join_weekly';

const GIVEAWAY_START_STR = 'Creating a new giveaway';
const GIVEAWAY_END_STR = 'Finishing current giveaway';
const GIVEAWAY_SKIPPING_STR = 'Skipping/Disabled';
const GIVEAWAY_ALREADY_EXISTS_STR = 'Skipping task <create giveaway>, giveaway already active';
const GIVEAWAY_DOESNT_EXISTS_STR = 'Skipping <finish giveaway>, giveaway doesn\'t exist';
const GIVEAWAY_NO_PARTICIPANTS_STR = 'Task <finish giveaway>, no winner - no participants';
const GIVEAWAY_FORCE_CYCLE_STR = 'FORCE_GIVEAWAY_CYCLE is enabled, closing and finishing up existing giveaway';
const GIVEAWAY_CREATE_FINISH_STR = 'Finished creating the giveaway';
const GIVEAWAY_INVALID_TYPE_STR = 'An invalid type was supplied, aborting';
const GIVEAWAY_NO_WINNER = 'Couldn\'t pick winner after 100 tries, returning.';

module.exports = {
  GIVEAWAY_LABEL_JOIN,
  GIVEAWAY_TAG_DAILY,
  GIVEAWAY_TAG_WEEKLY,
  GIVEAWAY_TYPE_DAILY,
  GIVEAWAY_TYPE_WEEKLY,

  DAILY_GIVEAWAY_BUTTON_JOIN_ID,
  WEEKLY_GIVEAWAY_BUTTON_JOIN_ID,

  GIVEAWAY_START_STR,
  GIVEAWAY_END_STR,
  GIVEAWAY_SKIPPING_STR,
  GIVEAWAY_ALREADY_EXISTS_STR,
  GIVEAWAY_DOESNT_EXISTS_STR,
  GIVEAWAY_NO_PARTICIPANTS_STR,
  GIVEAWAY_FORCE_CYCLE_STR,
  GIVEAWAY_CREATE_FINISH_STR,
  GIVEAWAY_INVALID_TYPE_STR,
  GIVEAWAY_NO_WINNER
};
