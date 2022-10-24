const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({

    server: String,
    channel: String,
    sender: String,
    senderDiscordId: String,
    emoji: String,
    reactionCount: String,
    createdTimestamp: String,
    createdAt: String,

});

module.exports = reactionSchema;