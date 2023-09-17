const fs = require('fs');

const getConfig = () => {
    var config = fs.readFileSync('config.json')
    return JSON.parse( config )
}

const writeNewToken = ( token ) => {
    var currentConfig = getConfig();

    currentConfig.service.auth.token = token;
    currentConfig.service.auth.last_refresh = Date.now();

    writeConfig( currentConfig );
}

const writeConfig = ( config ) => {
    fs.writeFileSync('config.json', JSON.stringify( config, null, 4 ))
} 

module.exports = {
    getConfig,
    writeNewToken
}