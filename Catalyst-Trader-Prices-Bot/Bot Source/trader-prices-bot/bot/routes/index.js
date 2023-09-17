const Discord = require('discord.js');
const client = new Discord.Client();

const { getChannel } = require('../../web/models/channel')
const { getItem } = require('../../web/models/item')

const isMessage = ( msg ) => {
    if ( msg.indexOf( process.env.COMMAND_PREFIX || "-p") == 0 && msg.indexOf(" ") == 2)
        return true;

    return false;
}
const getPattern = ( msg ) => {

    var message = "";

    for ( var i = 3; i<msg.length; i++)
        message += msg[i]

    message = message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    return message;
}

client.on('message', msg => {

    var channelId = msg.channel.id;
    var message = msg.content;

    if ( msg.author.bot || msg.author.id == client.user.id)
        return;

    if (!isMessage( message )) {
        //msg.reply(`Sorry, could not understand your query "${message}". use the format \`\`\`-p pattern\`\`\``);
        return;
    }

    var pattern = getPattern( message );

    console.log( pattern )

    getChannel( channelId, false)
    .then( ({result}) => {

        var channel = result;
        var channelIndex = channel.channelIndex;
        
        getItem( channelIndex, pattern)
        .then( ({result}) => {
            
            if ( result.length <= 0) {
                msg.reply(`Sorry, could not find any items with "${ pattern }"`);
                return;
            }

            var channel = 
            client.channels.cache
            .find(channel => channel.id === channelId)

            var embedMap = getItemEmbeds( result );


            sendEmbeds( channel, embedMap);


            

        })
        .catch( result => {
            console.log( result )
            msg.reply(`Sorry, could not find any items with "${ pattern }"`);
        })
    
    })
    .catch( result => {
        //msg.reply(`Channel not authorized to retrieve prices!`);
    })

  });

const sendEmbeds = ( channel, embeds ) => {

    for ( var [ location, embeds ] of Object.entries( embeds )) {

        embeds.forEach( embed => {

            channel.send( embed);

        })

    }

}

const getItemEmbeds = ( items ) => {

    var embedMap = new Map();

    var locationMap = new Map();

    var itemCount = items.length;

    var layout;

    if ( itemCount < 24)
        layout = 0;
    else 
        layout = 1;

    items.forEach( e => {

        var locations = e.locations;

        locations.forEach( loc => {

            if (locationMap[ loc ] === undefined)
                locationMap[ loc ] = [];


            locationMap[ loc ].push( e );
            
        })
    })


    const getPriceText = ( price ) => {

        var priceSTR;
        
        if ( price <= 0)
            return "N/A";
        
        priceSTR = `${process.env.CURRENCY || '$'} ${ price.toLocaleString() }`

        return priceSTR;
    }
        
    for ( var [ location, arr ] of Object.entries( locationMap )) {

        embedMap[ location ] = [];
        
        var embedBatch = [];

        var embed = new Discord.MessageEmbed()
        .setTitle( location )
        .setColor( parseInt( process.env.COLOR || "0x1ABC9C") )

        const maxItemsPerBatch = 24;
        
        var counter = 0;
        arr.forEach( item => {

            if ( counter >= maxItemsPerBatch ) {
                counter = 0;
                embedBatch.push( embed );

                embed = new Discord.MessageEmbed()
                .setAuthor( location )
                .setColor( parseInt( process.env.COLOR || "0x1ABC9C") )
            }
            
            switch( layout ) {
                case 0 : {
                    
                    embed.addFields( 
                        { name: 'Item', value: item.displayName, inline: true },
                        { name: 'Buy' , value: getPriceText(item.buyPrice) , inline: true },
                        { name: 'Sell' , value: getPriceText(item.sellPrice), inline: true }
                    );

                    counter += 3;

                    break;
                }
                case 1 : {


                    embed.addFields(
                        { name: `${item.displayName}`, value: `**Buy : ** ${ getPriceText(item.buyPrice)} \n **Sell : ** ${getPriceText( item.sellPrice)}`, inline: true}
                    )

                    counter += 1;


                    break;
                }

                default: {

                    break;
                }
            }


            // embed.addFields( 
            //     { name: 'Item', value: item.displayName, inline: true },
            //     { name: 'Buy' , value: getPriceText(item.buyPrice) , inline: true },
            //     { name: 'Sell' , value: getPriceText(item.sellPrice), inline: true }
            // );

        

        })

        if ( embed.fields.length > 0) 
            embedBatch.push( embed );

        embedBatch[ embedBatch.length - 1].setTimestamp()


        embedMap[location] =  embedBatch;

    }

    return embedMap;
    

}

module.exports = client;