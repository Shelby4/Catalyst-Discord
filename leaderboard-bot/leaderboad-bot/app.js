require('dotenv').config()

const discordApp = require('./bot')





discordApp.login(process.env.TOKEN)
.then( () => {

console.log(`
DISCORD ${process.env.APP_NAME} RUNNING
-> BOT NAME : ${ discordApp.user.tag } `)

})

.catch( (reason) => {

console.log(`
DISCORD ${process.env.APP_NAME} FAILED TO START
-> REASON : ${ reason } `)


})
