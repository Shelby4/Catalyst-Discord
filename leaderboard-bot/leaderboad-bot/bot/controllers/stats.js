const SteamID = require('steamid')

const leaderboard = require('dayz-leaderboards')
const { getHeavyEmbed, getLightEmbed, getUserStatEmbed } = require('./embeds')

const config = require('../../config.json')
const { getConfig } = require('./config')


const sendLeaderboards = (client, msg, params ) => {

    var channelId = msg.channel.id;

    var channel = 
    client.channels.cache
    .find(channel => channel.id === channelId)

    var commandType = params[1]
    var isHeavy = params[2] == 'heavy'
    var isOwnStats = false;

    var serviceId = params[0]

    //console.log( commandType, isHeavy, isOwnStats)

    try {
        isOwnStats = new SteamID( params[2] ).isValid();
    } catch (error) {
        isOwnStats = false;
    }

    if (isOwnStats)
    {
        leaderboard.getCFId( params[2] )
        .then( ( response ) => {

            var cfId = response.cftools_id;

            leaderboard.getUserStat( getConfig().service.auth.token, serviceId, cfId )
            .then( ( response ) => {
                var userStat = response.stat;

                channel.send( getUserStatEmbed( params[2], userStat ) )
            })
            .catch( (response) => {
                console.log(response)
            })

        })
        .catch( (response) => {

        })

        return;
    }


    leaderboard.getLeaderboards( getConfig().service.auth.token, serviceId, 25)
    .then( response => {
        var status = response.status;
        var leaderboard = response.leaderboard

        if (isHeavy)
            channel.send( getHeavyEmbed( leaderboard ) )
        else if ( params.length <= 2)
            channel.send( getLightEmbed( leaderboard ) )


    })
    
}

module.exports = {
    sendLeaderboards
}