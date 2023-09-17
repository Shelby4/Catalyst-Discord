const logger = require('@mirasaki/logger');
const chalk = require('chalk');
const { initDailyGiveaway, initWeeklyGiveaway } = require('../../modules/giveaways');
const { sendStickyMessage } = require('../../modules/suggestions');

module.exports = async (client) => {
  // Logging our process uptime to the developer
  const upTimeStr = chalk.yellow(`${Math.floor(process.uptime()) || 1} second(s)`);
  logger.success(`Client logged in as ${
    chalk.cyanBright(client.user.username)
  }${
    chalk.grey(`#${client.user.discriminator}`)
  } after ${upTimeStr}`);

  // Calculating the membercount
  const memberCount = client.guilds.cache.reduce(
    (previousValue, currentValue) =>
      previousValue += currentValue.memberCount, 0
  ).toLocaleString('en-US');

  // Send out sticky suggestion message
  await sendStickyMessage(client);

  // Getting the server count
  const serverCount = (client.guilds.cache.size).toLocaleString('en-US');

  // Giveaways
  initDailyGiveaway(client);
  initWeeklyGiveaway(client);

  // Logging counts to developers
  logger.info(`Ready to serve ${memberCount} members across ${serverCount} servers!`);
};
