const logger = require('@mirasaki/logger');
const { connect, connection } = require('mongoose');

module.exports = async () => {
  await connect(process.env.MONGO_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(error => console.log(error));
};

connection.once('open', () => {
  logger.success('Connected to MongoDB!');
});

connection.on('error', logger.printErr);
