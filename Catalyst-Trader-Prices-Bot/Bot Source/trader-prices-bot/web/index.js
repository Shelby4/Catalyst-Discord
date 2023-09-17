const express = require('express')
const router = express.Router();

const { getChannel } = require('./models/channel')
const { clearItems, updateList, getItem } = require('./models/item')

router.get('/', (req, res, next) => {
    res.status(200).json({
        status: 200,
        result: {
            message: `Nothing to find here, Move on!`
        }
    })
})

router.post('/clear', (req, res, next) => {
    var body = req.body;

    var channelId = body.channelId;

    getChannel( channelId )
    .then( ({ result }) => {
        var channelIndex = result.channelIndex;

        clearItems(channelIndex)
        .then(result => {
            res.status(200).json(result);   
        })
        .catch(result => {
            res.status(result.status).json(result);
        })
    })
})


router.post('/updatelist', (req, res, next) => {

    var body = req.body;
    
    var channelId = body.channelId;
    var items = body.items;

    var clearList = body.clearList;

    const updateItems = (channelIndex) => {
        /* add channelIndex member to each item to satisfy
        *  schema requirements */

        items.map( item => item.channelIndex = channelIndex );


        updateList( items)
        .then( result => {
            res.status(200).json(result)
        })
        .catch( result => {
            res.status(result.status).json(result);
        })
    }


    getChannel( channelId )
    .then( ({ result }) => {
        let channelIndex = result.channelIndex;

        if ( clearList != undefined && clearList == true) {
            clearItems( channelIndex )
            .then(() => {
                updateItems( channelIndex );

                
            });

            return;
        }


        updateItems( channelIndex );
    })


})

router.post('/getItem', (req, res, next) => {

    var body = req.body;

    var channelId = body.channelId;
    var searchPattern = body.searchPattern;

    getChannel( channelId )
    .then( ({ result }) => {

        channelIndex = result.channelIndex;

        getItem( channelIndex, searchPattern)
        .then(({result}) => {
            res.status(200).json(result);           
        })
        .catch(result => {
            res.status(result.status).json(result);           
        })


    })
    .catch( result => {
        res.status(result.status).json(result);
    })

    
})

module.exports = router;