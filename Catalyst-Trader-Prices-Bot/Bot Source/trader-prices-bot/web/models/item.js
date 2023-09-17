const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
    channelIndex: {
        type: String,
        required: true
    },
    className: {
        type:String,
        default: "",
        text: true
    },
    displayName: {
        type: String,
        default: "",
        text: true
    },
    buyPrice: {
        type: Number,
        required: true
    },
    sellPrice: {
        type: Number,
        required: true
    },
    traderName: {
        type: String
    },
    categoryName: {
        type: String
    },
    locations: {
        type: [String]
    }
    
})

const itemModel = mongoose.model('items', itemSchema)
itemModel.createIndexes();

/* clear items with channelIndex for batch update */
const clearItems = ( channelIndex ) => {
    return new Promise( ( resolve, reject) => {

        itemModel.deleteMany(
            { channelIndex},
            ( err ) => {

                if ( err ) {
                    reject({
                        status: 503,
                        result: `Could not clear items`
                    })
                    return;
                }

                resolve({
                    status: 200,
                    result: `Cleared items with index: ${channelIndex}`
                })

            }
        )

    })
}

/* update list */
const updateList = ( items ) => {
    return new Promise( (resolve, reject) => {

        itemModel.insertMany( items,
            ( err, doc) => {
                if ( err ) {
                    reject({
                        status: 503,
                        result: `Could not update list`
                    })

                    return;
                }

                resolve({
                    status: 200,
                    result: doc
                })
            })
    })
}

/* find item */
const getItem = ( channelIndex, pattern) => {
    return new Promise( ( resolve, reject) => {

        itemModel
            .find(
                { 
                    $and: [
                        { channelIndex },
                        { displayName: { "$exists" : true, "$ne" : "" } },
                        { 
                            $or: [
                                { displayName: new RegExp( pattern, 'gi') },
                                { className: new RegExp( pattern, 'gi') }
                            ]
                        }
                    ]
                },
                ( err, doc ) => {
                    if ( err || !doc ) {
                        reject({
                            status: 404,
                            result: `Could not find any items`
                        })
                        return;
                    }

                    resolve({
                        status: 200,
                        result: doc
                    })
                }
            )


    })
}


module.exports = {
    clearItems,
    updateList,
    getItem
};