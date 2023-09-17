const Discord = require('discord.js')
const config = require('../../config.json')

const getUserStatEmbed = ( steamUID, userStat ) => {
    var userStatEmbed = new Discord.MessageEmbed()
        .setTitle( `User Stats - ${steamUID}` )
        .setColor( parseInt( process.env.EMBEDCOLOR || "0x1ABC9C") )

    userStatEmbed
    .addFields({
        name: 'Name',
        value: `${userStat.latest_name|| 'Unknown'}`,
        inline: true
    },{
        name: 'Kills',
        value: `${userStat.kills || '0'}`,
        inline: true
    },{
        name: 'Deaths',
        value: `${userStat.deaths || '0'}`,
        inline: true
    },{
        name: 'K/D Ratio',
        value: `${userStat.kdratio || '0'}`,
        inline: true
    },{
        name: 'Longest Shot',
        value: `${userStat.longest_shot || '0'}m`,
        inline: true
    },{
        name: 'Play Time',
        value: new Date(userStat.playtime * 1000).toISOString().substr(11, 8),
        inline: true
    })

    return userStatEmbed;
}


const getHeavyEmbed = ( leaderboard ) => {
    var leaderBoardEmbed = new Discord.MessageEmbed()
        .setTitle( `Leaderboards` )
        .setColor( parseInt( process.env.EMBEDCOLOR || "0x1ABC9C") )

    const limit = 24;

    var counter = 0;
    const emote = config.bot.commandTypes
                        .stats.config.emote;

    leaderboard.forEach( ( stat ) => {

        if ( counter++ < limit)
            leaderBoardEmbed.addFields({
                name: stat.latest_name,
                value: `
                    ${emote} Rank: **${stat.rank || '0'}**
                    ${emote} Kills: ${stat.kills || '0'}
                    ${emote} Deaths: ${stat.deaths || '0'}
                    ${emote} KD: ${stat.kdratio || '0'}
                    ${emote} LK: ${stat.longest_kill || '0'}m`,
                inline: true
            })
    })

    return leaderBoardEmbed
}

const getLightEmbed = ( leaderboard ) => {
    var leaderBoardEmbed = new Discord.MessageEmbed()
    .setTitle( `Leaderboards` )
    .setColor( parseInt( process.env.EMBEDCOLOR || "0x1ABC9C") )

    var columns = [];

    for ( var i=0; i<3; i++)
        columns[i] = []

    leaderboard.
    forEach( ( stat ) => {
        columns[0].push( `#**${stat.rank}** \`${stat.latest_name}\` |`)
        columns[1].push( `\`${stat.kills}\`` )
        columns[2].push( `\`${stat.deaths || '0'}\`` )
        
    })

    columns[0] = columns[0].join('\n')
    columns[1] = columns[1].join('\n')
    columns[2] = columns[2].join('\n')
    
    leaderBoardEmbed.addFields( { name: 'Player Name', value: columns[0], inline: true } );
    leaderBoardEmbed.addFields( { name: 'Kills', value: columns[1], inline: true } );
    leaderBoardEmbed.addFields( { name: 'Deaths', value: columns[2], inline: true } );

    return leaderBoardEmbed
}

module.exports = {
    getHeavyEmbed,
    getLightEmbed,
    getUserStatEmbed
}