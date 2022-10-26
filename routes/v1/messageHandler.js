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
    const pageSize = req.query.pagesize ? parseInt(req.query.pagesize) : 0;

    if (page > 0) {
        page = page - 1;
    }


    try {

        const interaction = await DiscordMsg
            .find({
                createdTimestamp: { $gte: startTime, $lte: endTime }
            })
            .limit(pageSize)
            .skip(pageSize * page)
            .sort({ createdTimestamp: -1 })
        //.group({_id: '$senderDiscordId', count: { $sum: 1 }});

        //console.log(interaction);


        const result = Object.values(interaction.reduce((c, { senderDiscordId, sender }) => {
            // console.log(`C: ${JSON.stringify(c)}, id: ${senderDiscordId}`);
            c[senderDiscordId] = c[senderDiscordId] || { name: sender, senderDiscordId: senderDiscordId, count: 0 };
            c[senderDiscordId].count++;
            return c;
        }, {}));

        res.json({
            'total': result.length,
            'msgCount': result,

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
    const pageSize = req.query.pagesize ? parseInt(req.query.pagesize) : 0;

    console.log(`s: ${startTime}, e: ${endTime}`);

    if (page > 0) {
        page = page - 1;
    }


    try {


        const msgReactions = await DiscordMsg
            .find({
                "messageReactions.createdTimestamp": { $gte: startTime, $lte: endTime }
            }, 'messageReactions')
            .limit(pageSize)
            .skip(pageSize * page)
            .sort({ createdTimestamp: -1 });

        //console.log(msgReactions);

        let reactionArr = [];
        msgReactions.map(a => {
            a.messageReactions.forEach(element => {
                //console.log(element);
                reactionArr.push(element);
            });
        })

        //console.log(reactionArr);

        const reactionCount = Object.values(reactionArr.reduce((c, { senderDiscordId, sender }) => {
           // console.log(`C: ${JSON.stringify(c)}, id: ${senderDiscordId}`);
            c[senderDiscordId] = c[senderDiscordId] || { name: sender, senderDiscordId: senderDiscordId, count: 0 };
            c[senderDiscordId].count++;
            return c;
        }, {}));

        /*   const reactionCount = interaction.reduce((c, { senderDiscordId,sender }) => {
              console.log(`C: ${JSON.stringify(c)}, id: ${senderDiscordId}`);
             c[senderDiscordId] = c[senderDiscordId] || { name: sender, count: 0 };
             c[senderDiscordId].count++;
             return c;
         },{} );  */


        /* const msgReactions = await DiscordMsg
            .find({
                "messageReactions.createdTimestamp": { $gte: startTime, $lte: endTime }
            }, 'messageReactions')
            .limit(pageSize)
            .skip(pageSize * page)
            .sort({ createdTimestamp: -1 }); */
        //console.log(s);
        //console.log(e);

        /* const result = await DiscordMsg.aggregate( [
            { $match: {'createdTimestamp': { $gte: startTime, $lte: endTime } }},
            //{ $group: { _id: '$senderDiscordId', count: { $sum: 1 } } }
          ] ); */

        // console.log(result);


        res.json({
            'total': reactionCount.length,
            'msgCount': reactionCount,
            //'data':msgReactions
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