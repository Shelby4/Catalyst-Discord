const { getConfig, writeNewToken } = require('./config')
const leaderboard = require('dayz-leaderboards')

const refreshToken = () => {
    return new Promise( (resolve, reject) => {

        console.log(`REFRESHING TOKEN`)

        leaderboard.refreshToken( getConfig().service.auth.application_id, getConfig().service.auth.secret)
        .then( ( response ) => {
            var token = response;

            writeNewToken( token )

            resolve(true)
        })
        .catch( ( response ) => {

            reject(response)
        })
    })
}

const validateToken = async () => {
    var lastRefresh = getConfig().service.auth.last_refresh;

    if ( lastRefresh === undefined )
    {
        await refreshToken();
        return;
    }


    
    /* Compare current time with last refreshed time */

    var currentTimeStamp = Date.now()
    //lastRefresh = Date.parse( lastRefresh )
    
    var hours = Math.abs(currentTimeStamp - lastRefresh) / 36e5;

    if ( hours >= 23)
        await refreshToken();
    
}

module.exports = { validateToken }