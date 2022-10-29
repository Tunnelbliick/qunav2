import DiscordJS, { Intents } from 'discord.js'
import WOKCommands from 'wokcommands'
import path from 'path'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import { loadTournaments, ongoingWorldCup } from './loadtournaments'
dotenv.config()
const RedisServer = require('redis-server');

const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS],
    partials: ['CHANNEL']
})

client.on('ready', async () => {
    try {
        console.log(`Logged in as ${client.user?.tag}!`);

        await mongoose.connect(process.env.mongodb || "", {
            keepAlive: true
        })
        console.log("Connected to MongoDB!")

        const server = new RedisServer({
            port: 6379,
            bin: 'C:/Program Files/Redis/redis-server.exe'
        });

        server.open((err: any) => {
            if (err === null) {
                console.log("You may now connect a client to the Redis")
            }
        });

        new WOKCommands(client, {
            commandsDir: path.join(__dirname, '/src/commands'),
            featuresDir: path.join(__dirname, '/src/handlers'),
            mongoUri: process.env.mongodb,
            typeScript: true,
            showWarns: false,
            disabledDefaultCommands: [
                "help"
            ],
            testServers: ['940446029436821514']
        });
    } catch (err) {
        console.log(err);
    }

    await loadTournaments();
    ongoingWorldCup();
})

process.on('unhandledRejection', err => {
    console.error('Unhandled promise rejection:', err);
});

client.on("warn", (e) => console.warn(e));

client.login(process.env.token);