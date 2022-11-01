const mongoose = require('mongoose');
const messageReaction = require('./reactionSchema');

const messageSchema = mongoose.Schema({
    messageId: String,
    server: String,
    channel: String,
    sender: String,
    senderDiscordId: String,
    message: String,
    createdTimestamp: Number,
    createdAt: String,
    messageReactions: [messageReaction]
});

module.exports = messageSchema;