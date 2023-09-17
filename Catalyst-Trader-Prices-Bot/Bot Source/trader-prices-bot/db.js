/**
 * @name db.js
 */


 const mongoose = require('mongoose')

 const CONNECTION_URI = process.env.CONNECTION_URI || 'mongodb://localhost:27017/'
 
 const connectToDatabase = () => {
     return new Promise((resolve, reject) => {
         mongoose.connect(
             CONNECTION_URI, 
             {
                 useNewUrlParser: true, 
                 useUnifiedTopology: true, 
                 useCreateIndex: true,
                 useFindAndModify: false
             }, 
             (err) => {      
                 if(err) {
                     reject({
                         message: `*** Could not connect to MongoDB server ***`
                     })
                     return
                 }
 
                 resolve({
                     message: `*** Succesfully connected to MongoDB server ***`
                 })
             }
         );
     })
 }
 
 
 module.exports = { connectToDatabase }