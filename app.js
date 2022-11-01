const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const express = require("express");
const { Client, Events, Intents, GatewayIntentBits, Partials } = require('discord.js');
const cors = require('cors');
const messageSchema = require('./schema/messageSchema');
const discordMsgRouter = require('./routes/v1/messageHandler');
const reactionSchema = require('./schema/reactionSchema');

const DiscordMsg = new mongoose.model('DiscordMsg', messageSchema);
const DiscordReaction = new mongoose.model('DiscordReaction', reactionSchema);

const app = express();

app.use(cors())
app.use(express.json());

app.use("/api/v1", discordMsgRouter);

const client = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,

        ],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    }
);

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`${client.user.username} is Ready!`);
});

client.on('messageCreate', async (message) => {
    /* console.log(
        `Channel: ${message.channel.name} 
        Server: ${message.guild.name} 
        Sender: ${message.author.username}
        Message: ${message.content} 
        CreatedTimestamp: ${message.createdTimestamp} 
        CreatedAt: ${message.createdAt}`); */
    const msg = new DiscordMsg({
        messageId: message.id,
        server: message.guild.name,
        channel: message.channel.name,
        sender: message.author.username,
        senderDiscordId: message.author.id,
        message: message.content,
        createdTimestamp: message.createdTimestamp,
        createdAt: message.createdAt,


    });

    try {
        const discordMsg = await msg.save();
        console.log(discordMsg);

    } catch (error) {
        console.error(error);
    }


});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    // When a reaction is received, check if the structure is partial

    //console.log(user);
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    const messageReaction = new DiscordReaction({
        //id: reaction.message.id,
        messageId: reaction.message.id,
        server: reaction.message.guild.name,
        channel: reaction.message.channel.name,
        sender: user.username,
        senderDiscordId: user.id,
        emoji: reaction.emoji.name,
        reactionCount: reaction.count,
        createdTimestamp: reaction.message.createdTimestamp,
        createdAt: reaction.message.createdAt,
    })

    //console.log(react);
    /* try {
        const result = await DiscordMsg.findOneAndUpdate(
            { messageId: reaction.message.id },
            { $push: { messageReactions: messageReaction } },
            { new: true }
        );

       // console.log(result);

    } catch (error) {
        console.error(error);
    } */

    try {
        const discordReaction = await messageReaction.save();
        console.log(discordReaction);
    } catch (error) {
        console.error(error);
    }



    // Now the message has been cached and is fully available
    //console.log(`${reaction.message.author}'s message "${reaction.emoji.name}" gained a reaction!`);
    // The reaction is now also fully available and the properties will be reflected accurately:
    //console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
});



client.login(process.env.DISCORD_BOT_TOKEN);
//console.log(process.env.DISCORD_BOT_TOKEN);

mongoose.connect(process.env.DB_CONNECTION_URL, () => {
    console.log('Connected DB at ' + process.env.DB_CONNECTION_URL);
});

app.listen(process.env.PORT, () => {
    console.log('Server is running at port', process.env.PORT);
});