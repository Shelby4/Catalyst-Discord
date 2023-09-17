const mongoose = require('mongoose')
const { getIndexCounter } = require('./index')

const channelSchema = mongoose.Schema({
    channelId: {
        type: String,
        required: true
    },
    channelIndex: {
        type: Number,
        required: true
    }
})

const channelModel = mongoose.model('channels', channelSchema)

const getChannel = ( channelId, createNew ) => {
    return new Promise( ( resolve, reject ) => {

        channelModel
        .findOne(
            { channelId },
            ( err, doc) => {
                if (err || !doc) {

                    console.log( doc );

                    if ( createNew !== undefined && !createNew ) {
                        reject({
                            status: 404,
                            result: `Channel not found`
                        })
                        return;
                    }
                    

                    /* Channel not found, Create new channel */
                    getIndexCounter( `channels` )
                    .then( ({ result }) => {

                        var nextIndex = result.counter;

                        var newChannel = new channelModel({
                            channelId,
                            channelIndex: nextIndex
                        })

                        newChannel.save();

                        console.log('new channel' + newChannel)

                        resolve({
                            status: 200,
                            result: newChannel
                        })

                        return;
                        

                    }).catch(( err ) => {
                        console.log( err)
                    })

                    return;
                    
                }

                /* Return the document, no error */

                resolve({
                    status: 200,
                    result: doc
                })

            }
        )

    })

}


module.exports = {
    getChannel
};