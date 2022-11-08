const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const discordMsgSchema = require('../../schema/messageSchema');
const reactionSchema = require('../../schema/reactionSchema');

// Get all message

// Creating Model for object mapping
const DiscordMsg = new mongoose.model("DiscordMsg", discordMsgSchema);
const DiscordReaction = new mongoose.model("DiscordReaction", reactionSchema);

// Get discord msgs
router.get('/discord-messages', async (req, res) => {
    let page = req.query.page ? parseInt(req.query.page) : 0;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;


    if (page > 0) {
        page = page - 1;
    }

    try {

        const totalMsg = await DiscordMsg.countDocuments().exec();
        let discordMsgs = await DiscordMsg.find({})
            .limit(pageSize)
            .skip(pageSize * page)
            .sort({ createdTimestamp: -1 });

        const result = discordMsgs.map((x, index) => {
            //console.log(Array.isArray(x.messageReactions));

            //console.log(Object.keys(x._doc));
            let Array2 = Object.values(
                x.messageReactions.reduce((c, { emoji }) => {
                    c[emoji] = c[emoji] || { key: emoji, count: 0 };
                    c[emoji].count++;
                    return c;
                }, {})
            );

            //console.log(Array2);
            x._doc.counter = Array2;

            return x;
        });

        res.json({
            'total': totalMsg,
            'discordMsgs': result
        });


    } catch (error) {
        //console.log(error);
        res.json({
            'message': 'Something went wrong!',
            'error': error,
        });
    }
});

// Get message count



router.get('/user-interactions/message-count', async (req, res) => {

    let startTime = req.query.startTime ? parseInt(req.query.startTime) : 0;
    let endTime = req.query.endTime ? parseInt(req.query.endTime) : Date.now();

    let page = req.query.page ? parseInt(req.query.page) : 0;
    let pageSize = req.query.pagesize ? parseInt(req.query.pagesize) : 10;

    //console.log(pageSize);

    if (page > 0) {
        page = page - 1;
    }



    try {

        const result = await DiscordMsg.aggregate([
            //{ $unwind: '$messageReactions' },
            {
                $lookup:
                {
                    from: "users", //another collection name
                    localField: "senderDiscordId", // order collection field
                    foreignField: "discordInfo.id", // inventory collection field
                    as: "user-info"
                }
            },
            {
                $match:
                    { 'createdTimestamp': { $gte: startTime, $lte: endTime } }
            },
            {
                $group:
                {
                    _id: '$senderDiscordId',
                    name: { $first: '$sender' },
                    address: { $first: '$user-info.wallet.accountAddress' },
                    count: { $sum: 1 }
                }
            },
            { "$sort": { createdTimestamp: -1 } },
            { "$limit": pageSize },
            { "$skip": pageSize * page },

        ]);

        // console.log(result);


        res.json({
            'total': result.length,
            'interactionCount': result,
            //'reactionCount': result
        });



    } catch (error) {
        console.error(error);
        res.json({
            'message': "Something went wrong",
            'error': error
        });
    }


});

// Get reaction count

router.get('/user-interactions/reaction-count', async (req, res) => {

    let startTime = req.query.startTime ? parseInt(req.query.startTime) : 0;
    let endTime = req.query.endTime ? parseInt(req.query.endTime) : Date.now();

    let page = req.query.page ? parseInt(req.query.page) : 0;
    const pageSize = req.query.pagesize ? parseInt(req.query.pagesize) : 10;

    //console.log(`s: ${startTime}, e: ${endTime}`);

    if (page > 0) {
        page = page - 1;
    }


    try {

        const result = await DiscordMsg.aggregate([
            { $unwind: '$messageReactions' },
            {
                $lookup:
                {
                    from: "users", //another collection name
                    localField: "senderDiscordId", // order collection field
                    foreignField: "discordInfo.id", // inventory collection field
                    as: "user-info"
                }
            },
            {
                $match:
                    { 'messageReactions.createdTimestamp': { $gte: startTime, $lte: endTime } }
            },
            {
                $group:
                {
                    _id: '$messageReactions.senderDiscordId',
                    name: { $first: '$messageReactions.sender' },
                    address: { $first: '$user-info.wallet.accountAddress' },
                    count: { $sum: 1 }
                }
            },
            { "$sort": { 'messageReactions.createdTimestamp': -1 } },
            { "$limit": pageSize },
            { "$skip": pageSize * page },

        ]);

        // console.log(result);


        res.json({
            'total': result.length,
            //'msgCount': reactionCount,
            'interactionCount': result
        });



    } catch (error) {
        console.error(error);
        res.json({
            'message': "Something went wrong",
            'error': error
        });
    }


})

module.exports = router;