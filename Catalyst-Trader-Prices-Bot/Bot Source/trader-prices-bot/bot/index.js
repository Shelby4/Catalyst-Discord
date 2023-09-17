const client = require('./routes');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

module.exports = client;