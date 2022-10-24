const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const discordMsgSchema = require('../../schema/messageSchema');

// Get all message

// Creating Model for object mapping
const DiscordMsg = new mongoose.model("DiscordMsg", discordMsgSchema);


router.get('/discord-messages', async (req, res) => {
    let page = req.query.page ? parseInt(req.query.page) : 0;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;


    if (page > 0) {
        page = page - 1;
    }

    try {

        const totalMsg = await DiscordMsg.countDocuments().exec();
        const discordMsgs = await DiscordMsg.find({})
            .limit(pageSize)
            .skip(pageSize * page)
            .sort({ date: -1 });
        res.json({ 'total': totalMsg, discordMsgs: discordMsgs });

        
    } catch (error) {
        //console.log(error);
        res.json({
            'message': 'Something went wrong!',
            'error': error,
        });
    }
});

module.exports = router;