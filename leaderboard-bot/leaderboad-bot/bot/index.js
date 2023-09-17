const Discord = require('discord.js')

const client = new Discord.Client()

require('./controllers')(client)

module.exports = client