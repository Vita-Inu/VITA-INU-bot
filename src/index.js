"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viteClient = exports.httpProvider = void 0;
var vitejs_http_1 = require("@vite/vitejs-http");
var vitejs_1 = require("@vite/vitejs");
var fs = require('fs'); // Loads the Filesystem library
var Discord = require('discord.js'); // Loads the discord API library
var Config = require('../config.json'); // Loads the configuration values
// Grab data from .env
require('dotenv').config();
var client = new Discord.Client(); // Initiates the client
client.botConfig = Config; // Stores the config inside the client object so it's auto injected wherever we use the client
client.botConfig.rootDir = __dirname; // Stores the running directory in the config so we don't have to traverse up directories.
var cooldowns = new Discord.Collection(); // Creates an empty list for storing timeouts so people can't spam with commands
var RPC_NET = process.env.TESTNET; // Default to TESTNET
// Decide the RPC_NET value depending on what network bot is configued for
if (client.botConfig.network == 'MAINNET') {
    console.log("Loading MAINNET");
    RPC_NET = process.env.MAINNET;
}
else if (client.botConfig.network == 'TESTNET') {
    console.log("Loading TESTNET");
    RPC_NET = process.env.TESTNET;
}
else {
    console.log("Invalid network specified. Please check config.json.");
}
// Set up HTTP RPC client and ViteClient
exports.httpProvider = new vitejs_http_1.HTTP_RPC(RPC_NET);
exports.viteClient = new vitejs_1.ViteAPI(exports.httpProvider, function () {
    console.log('Vite client successfully connected: ');
});
// Starts the bot and makes it begin listening to events.
client.on('ready', function () {
    // Log successful login
    console.log("VITA INU Bot Online as " + client.user.username +
        " with prefix " + client.botConfig.prefix);
    var statusMessage = "say " + client.botConfig.prefix + "help | Online";
    // Set the client user's presence
    client.user.setPresence({ activity: { name: statusMessage }, status: "online" })
        .catch(console.error);
});
// Dynamically load commands from commands directory
client.commands = new Discord.Collection();
var commandFiles = fs.readdirSync('./dist/commands').filter(function (file) { return file.endsWith('.js'); });
for (var _i = 0, commandFiles_1 = commandFiles; _i < commandFiles_1.length; _i++) {
    var file = commandFiles_1[_i];
    var command = require("./commands/" + file);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    console.log("Adding new command " + command.name + " from file \"" + file + "\"");
    client.commands.set(command.name, command);
}
// Dynamically run commands
client.on('message', function (message) {
    var prefix = client.botConfig.prefix;
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;
    var args = message.content.slice(prefix.length).trim().split(/ +/);
    var command = args.shift().toLowerCase();
    if (!client.commands.has(command)) {
        console.error("Unknown command: " + command);
        message.channel.send('I do not know what ' + command + ' means.');
        return;
    }
    try {
        client.commands.get(command).execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.channel.send('There was an error trying to execute ' + command.name);
    }
});
// Log the bot in using the token provided in the config file
client.login(client.botConfig.token)
    .catch(function (err) {
    console.log("Failed to authenticate with Discord network: \"" + err.message + "\"");
});
