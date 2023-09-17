// Import from packages
const moment = require('moment');
const cron = require('node-cron');
const logger = require('@mirasaki/logger');
const { stripIndents } = require('common-tags/lib');

// Local imports
const { colorResolver } = require('../util');
const { getSettings } = require('../mongo/guilds');
const { GiveawayModel } = require('../mongo/giveaways');
const dailyRewards = require('../../config/daily-rewards.json');
const weeklyRewards = require('../../config/weekly-rewards.json');
const { GIVEAWAY_LABEL_JOIN, GIVEAWAY_TAG_DAILY, GIVEAWAY_START_STR, GIVEAWAY_TAG_WEEKLY, GIVEAWAY_TYPE_DAILY, GIVEAWAY_TYPE_WEEKLY, GIVEAWAY_SKIPPING_STR, GIVEAWAY_ALREADY_EXISTS_STR, GIVEAWAY_FORCE_CYCLE_STR, GIVEAWAY_CREATE_FINISH_STR, GIVEAWAY_INVALID_TYPE_STR, WEEKLY_GIVEAWAY_BUTTON_JOIN_ID, DAILY_GIVEAWAY_BUTTON_JOIN_ID, GIVEAWAY_END_STR, GIVEAWAY_DOESNT_EXISTS_STR, GIVEAWAY_NO_PARTICIPANTS_STR, GIVEAWAY_NO_WINNER } = require('../constants/giveaway');

// Destructure from env
const {
  DEBUG_GIVEAWAYS,
  DAILY_GIVEAWAY_CHANNEL,
  WEEKLY_GIVEAWAY_CHANNEL,
  FORCE_CLOSE_DAILY_GIVEAWAY,
  FORCE_CLOSE_WEEKLY_GIVEAWAY,
  FORCE_GIVEAWAY_CYCLE
} = process.env;

// Resolve date identifier for given Date object
const getDailyGiveawayIdentifier = (date) => `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
const getWeeklyGiveawayIdentifier = (date) => `${moment(date).isoWeek()}-${date.getFullYear()}`;
module.exports.getDailyGiveawayIdentifier = getDailyGiveawayIdentifier;
module.exports.getWeeklyGiveawayIdentifier = getWeeklyGiveawayIdentifier;

/**
 * Initializes the daily giveaway
 * @param {import('discord.js').Client} client The discord.js client
 */
const initDailyGiveaway = async (client) => {
  const channel = await client.channels.fetch(DAILY_GIVEAWAY_CHANNEL);

  // Initial call on boot - checks active
  await createGiveaway(channel, GIVEAWAY_TYPE_DAILY);
  if (FORCE_CLOSE_DAILY_GIVEAWAY === 'true') {
    await finishGiveaway(channel, GIVEAWAY_TYPE_DAILY);
  }

  // Schedule giveaway cycle
  cron.schedule('0 12 * * *', async () => {
    await finishGiveaway(channel, GIVEAWAY_TYPE_DAILY);
    await createGiveaway(channel, GIVEAWAY_TYPE_DAILY);
  });
};
module.exports.initDailyGiveaway = initDailyGiveaway;

/**
 * Initializes the weekly giveaway
 * @param {import('discord.js').Client} client The discord.js client
 */
const initWeeklyGiveaway = async (client) => {
  const channel = await client.channels.fetch(WEEKLY_GIVEAWAY_CHANNEL);

  // Initial call on boot - checks active
  await createGiveaway(channel, GIVEAWAY_TYPE_WEEKLY);
  if (FORCE_CLOSE_WEEKLY_GIVEAWAY === 'true') {
    await finishGiveaway(channel, GIVEAWAY_TYPE_WEEKLY);
  }

  // Schedule weekly giveaway cycle
  cron.schedule('59 11 * * 0', async () => {
    await finishGiveaway(channel, GIVEAWAY_TYPE_WEEKLY);
    await createGiveaway(channel, GIVEAWAY_TYPE_WEEKLY);
  });
};
module.exports.initWeeklyGiveaway = initWeeklyGiveaway;

/**
 * Prints debug messages related to the giveaway module
 * @param {string} type The type of giveaway, 'daily' or 'weekly'
 * @param {string} str The message to show in the debug log
 * @param {object} giveaway The giveaway data
 */
const debugGiveaway = (type, str, giveaway = null) => {
  // Return if disabled
  if (DEBUG_GIVEAWAYS !== 'true') return;

  // Resolve the giveaway tag
  const giveawayTag = type === GIVEAWAY_TYPE_WEEKLY
    ? GIVEAWAY_TAG_WEEKLY
    : GIVEAWAY_TAG_DAILY;

  // Resolve debugging string
  let debugStr;
  if (giveaway && giveaway.date) debugStr = `${giveawayTag} <${giveaway.date}>`;
  else debugStr = giveawayTag;

  // Print to the console
  logger.debug(`${debugStr} - ${str}`);
};
module.exports.debugGiveaway = debugGiveaway;

/**
 * Creates a new giveaway in the given channel
 * @param {import('discord.js').TextBasedChannel} channel Text based channel
 * @param {'daily' | 'weekly'} type The type of giveaway, 'daily' or 'weekly'
 * @returns {object | void} The created giveaway data or nothing if creation failed
 */
const createGiveaway = async (channel, type) => {
  // Return if type is invalid
  if (type !== GIVEAWAY_TYPE_WEEKLY && type !== GIVEAWAY_TYPE_DAILY) {
    debugGiveaway('Invalid Type', GIVEAWAY_INVALID_TYPE_STR);
    return;
  }

  // Debug logging
  debugGiveaway(type, GIVEAWAY_START_STR);

  // Definitions
  const dateId = type === GIVEAWAY_TYPE_WEEKLY
    ? getWeeklyGiveawayIdentifier(new Date())
    : getDailyGiveawayIdentifier(new Date());
  const rewardList = type === GIVEAWAY_TYPE_WEEKLY ? weeklyRewards : dailyRewards;
  const randomItem = rewardList[ Math.floor(Math.random() * dailyRewards.length) ];
  const settings = await getSettings(channel.guild.id);
  const giveawayActiveSettingKey = type === GIVEAWAY_TYPE_WEEKLY ? 'weeklyGiveawayActive' : 'dailyGiveawayActive';
  const giveawayTag = type === GIVEAWAY_TYPE_WEEKLY ? GIVEAWAY_TAG_WEEKLY : GIVEAWAY_TAG_DAILY;
  const giveawayTimeFrame = type === GIVEAWAY_TYPE_WEEKLY ? 'This week' : 'Today';
  const giveawayUniqueButtonId = type === GIVEAWAY_TYPE_WEEKLY ? WEEKLY_GIVEAWAY_BUTTON_JOIN_ID : DAILY_GIVEAWAY_BUTTON_JOIN_ID;


  // Return if disabled
  if (!settings[giveawayActiveSettingKey]) {
    debugGiveaway(type, GIVEAWAY_SKIPPING_STR);
    return;
  }

  // Force close (finish) the giveaway and continue creating a new one
  if (FORCE_GIVEAWAY_CYCLE === 'true') {
    debugGiveaway(type, GIVEAWAY_FORCE_CYCLE_STR);
    await finishGiveaway(channel, type);
    await GiveawayModel.deleteOne({ data: dateId, type });
  }

  // Return if a giveaway is already active
  const existingData = await GiveawayModel.findOne({ date: dateId, type });
  if (existingData) {
    debugGiveaway(type, GIVEAWAY_ALREADY_EXISTS_STR);
    return;
  }

  // Send the new giveaway message, present this early because we need
  // the message id to save to our database
  const msg = await channel.send({
    embeds: [{
      title: giveawayTag,
      description: stripIndents`
            A new ${type} giveaway is active.

            ${giveawayTimeFrame}'s prize:
            \`\`\`
            • ${randomItem.join('\n• ')}
            \`\`\`

            Enter by clicking the **\`🎁 ${GIVEAWAY_LABEL_JOIN}\`** button at the bottom of this message.
          `,
      color: colorResolver()
    }],
    components: [
      {
        type: 1, // Action Row
        components: [{
          type: 2, // Button
          label: GIVEAWAY_LABEL_JOIN,
          style: 3,
          custom_id: giveawayUniqueButtonId,
          emoji: {
            id: null,
            name: '🎁'
          }
        }]
      }
    ]
  });

  // Create the new giveaway data in database
  let newGiveawayData;
  try {
    newGiveawayData = new GiveawayModel({ date: dateId, type, prize: randomItem, messageId: msg.id });
    await newGiveawayData.save();
  } catch (err) {
    console.error(err);
  }

  // Finish up by logging to console
  debugGiveaway(type, GIVEAWAY_CREATE_FINISH_STR, newGiveawayData);

  // And finally, return the giveaway data
  return newGiveawayData;
};
module.exports.createGiveaway = createGiveaway;

/**
 * Draws a winner for given giveaway
 * @param {import('discord.js').Guild} guild The giveaway guild
 * @param {array} entered The collection of participants
 * @returns {import('discord.js').GuildMember | void} The chosen winner or nothing if winner can't be chosen
 */
const drawWinner = async (guild, entered) => {
  let winner;
  let tries = 0;
  while (!winner) {
    try {
      if (tries >= 100) break;
      tries++;
      const randomId = entered[ Math.floor( Math.random() * entered.length ) ];
      winner = await guild.members.fetch(randomId);
    } catch {
      // They left the server
    }
  }
  return winner;
};
module.exports.drawWinner = drawWinner;

/**
 * Finishes a giveaway in the given channel
 * @param {import('discord.js').TextBasedChannel} channel Text based channel
 * @param {'daily' | 'weekly'} type The type of giveaway, 'daily' or 'weekly'
 * @returns {object | void} The finished/completed giveaway data or nothing if finishing up failed
 */
const finishGiveaway = async (channel, type) => {
  // Return if type is invalid
  if (type !== GIVEAWAY_TYPE_WEEKLY && type !== GIVEAWAY_TYPE_DAILY) {
    debugGiveaway('Invalid Type', GIVEAWAY_INVALID_TYPE_STR);
    return;
  }

  // Debug logging
  debugGiveaway(type, GIVEAWAY_END_STR);

  // Definitions
  const dateId = type === GIVEAWAY_TYPE_WEEKLY
    ? getWeeklyGiveawayIdentifier(new Date())
    : getDailyGiveawayIdentifier(new Date());
  const currGiveawayData = await GiveawayModel.findOne({ date: dateId, type });
  const giveawayUniqueButtonId = type === GIVEAWAY_TYPE_WEEKLY ? WEEKLY_GIVEAWAY_BUTTON_JOIN_ID : DAILY_GIVEAWAY_BUTTON_JOIN_ID;

  if (!currGiveawayData) {
    if (DEBUG_GIVEAWAYS === 'true') {
      logger.debug('[Daily Giveaway] - Skipping <finish giveaway>, giveaway doesn\'t exist');
    }
    return;
  }

  // Return if no giveaway for type exists at this time
  if (!currGiveawayData) {
    debugGiveaway(type, GIVEAWAY_DOESNT_EXISTS_STR, currGiveawayData);
    return;
  }

  // Destructure from giveaway data
  const { entered, messageId } = currGiveawayData;

  // Resolve the giveaway message, continue silently if it doesn't exists
  let message;
  try {
    message = await channel.messages.fetch(messageId);
  } catch (err) {
    // Continue if there's no message, we check when we try to call it
  }

  // Check API availability
  const { guild } = channel;
  if (guild.available === false) return;

  // Wrap if if no one entered the giveaway
  if (entered.length === 0) {
    debugGiveaway(type, GIVEAWAY_NO_PARTICIPANTS_STR, currGiveawayData);
    if (message) await message.edit({
      content: '⛔ No one has participated in this giveaway.',
      components: []
    }).catch(() => {/* Continue if no message */});
    return;
  }

  // Draw a winner for this giveaway
  const winner = await drawWinner(guild, entered);

  // Cancel out completely if choosing a winner is not possible
  if (!winner) {
    debugGiveaway(type, GIVEAWAY_NO_WINNER, currGiveawayData);
    return;
  }

  // Update the message accordingly
  if (message) await message.edit({
    content: `✅ - ${winner} has won this giveaway! 🥳`,
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            label: GIVEAWAY_LABEL_JOIN,
            style: 3,
            custom_id: giveawayUniqueButtonId,
            emoji: {
              id: null,
              name: '🎁'
            },
            disabled: true
          }
        ]
      }
    ]
  }).catch(() => {/* Continue if no message */});
};
