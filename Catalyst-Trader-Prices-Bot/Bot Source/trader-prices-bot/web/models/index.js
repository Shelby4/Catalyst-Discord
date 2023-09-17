const mongoose = require('mongoose')

const indexSchema = mongoose.Schema({
    indexName: {
        type: String,
        required: true,
        unique: true
    },
    counter: {
        type: Number,
        required: true,
        default: 0
    }
})

const indexModel = mongoose.model('indeces', indexSchema);

const getIndexCounter = ( indexName ) => {
    return new Promise( (resolve, reject) => {

        indexModel
        .findOneAndUpdate(
            { indexName },
            { $inc: { counter: 1 } },
            { upsert: true, new: true },
            ( err , doc) => {

                console.log(err)
                
                if ( err || !doc ) {
                    reject({
                        status: 404,
                        result: {
                            message: `Could not create new index`
                        }
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
    getIndexCounter   
};