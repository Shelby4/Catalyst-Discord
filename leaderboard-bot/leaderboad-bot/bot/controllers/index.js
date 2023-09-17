const stats = require('./stats')

const { getParams } = require('../lib/params');
const { sendLeaderboards } = require('./stats');

const config = require('../../config.json');
const { validateToken } = require('./cftoken');

const isAuthorizedChannel = ( commandType, channelId) => {

    return config.bot.commandTypes[ commandType ]
        .authorizedChannels.indexOf( channelId ) != -1

}

const IsServerId = ( arg ) => {

    if ( config.service.serviceId[ arg ] !== undefined)
        return true;

    return false;
}

const getDefaultServerId = () => {

    var firstKey = Object.keys(config.service.serviceId)[0];

    return config.service.serviceId[firstKey];
}

const getServerId = ( id ) => {
    return config.service.serviceId[id];
}


const OnMessage = async (client, msg) => {


    var params = getParams(msg);

    var prefix = params[0]

    if ( prefix != config.bot.command )
        return;


    if ( IsServerId( params[1] ) ) {
        params[1] = getServerId( params[1] );
        
        for ( var i=0; i<params.length; i++) {
            if( params[i + 1] === undefined)
                break;
            params[i] = params[ i + 1 ]
        }

        params.pop( params.length - 1 )
    } else
        params[0] = getDefaultServerId();

    console.log( params )


    var commandType = params[1]

    if ( !isAuthorizedChannel( commandType, msg.channel.id ))
        return;

    await validateToken()

    switch( commandType ) {
        case 'stats': 
            sendLeaderboards(client, msg, params);
            break;
        default: 
            break;
    }
    


}










const setControllers = ( client ) => 
{
    client.on('message', (msg) => {
        OnMessage( client, msg)
    })
}

module.exports = setControllers

