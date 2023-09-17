require('dotenv').config()

const db = require('./db')

const PORT = process.env.PORT || 3000;

const express = require('express');
const morgan = require('morgan')
const app = express();

const routes = require('./web')


app.use( express.json() )
app.use( morgan('dev') )
app.use( routes );

db.connectToDatabase()
.then( () => {
  app.listen( PORT, () => console.log( `TRADER PRICES API LISTENING TO PORT : ${PORT}`))
})
.catch( (err) => {
  console.log( err )
})


const discordApp = require('./bot')

discordApp.login(process.env.TOKEN);