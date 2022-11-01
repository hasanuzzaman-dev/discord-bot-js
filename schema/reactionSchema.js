const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({

    messageId: String,
    server: String,
    channel: String,
    sender: String,
    senderDiscordId: String,
    emoji: String,
    reactionCount: String,
    createdTimestamp: Number,
    createdAt: String,

});

module.exports = reactionSchema;