import { HTTP_RPC } from '@vite/vitejs-http';
import { WS_RPC } from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';

const fs = require('fs');                   // Loads the Filesystem library
const Discord = require('discord.js');      // Loads the discord API library
const Config = require('../config.json');    // Loads the configuration values

const client = new Discord.Client(); // Initiates the client
client.botConfig = Config; // Stores the config inside the client object so it's auto injected wherever we use the client
client.botConfig.rootDir = __dirname; // Stores the running directory in the config so we don't have to traverse up directories.

// Info for lookup
const tti = Config.tti;	// TTI of token we're watching
const devWallet = Config.devWallet; 
const viteNode = Config.viteNode;

// Determine whether to set up HTTP or WS
var provider;
if(viteNode.startsWith("http")) {
	console.log("Loading " + client.botConfig.network + "  with http node " + viteNode);
	provider = new HTTP_RPC(viteNode);
} else if(viteNode.startsWith("ws")) {
	console.log("Loading " + client.botConfig.network + "  with ws node " + viteNode);
	provider = new WS_RPC(viteNode);
} else {
	console.log("Invalid protocol for node: " + viteNode + ". Please add https:// or wss://");
	process.exit(0);
}

// Set up ViteClient API
export var viteClient = new ViteAPI(provider, () => {
    console.log('Vite client successfully connected: ');
});

// Starts the bot and makes it begin listening to events.
client.on('ready', () => {
    // Log successful login
    console.log("VITA INU Bot Online as " + client.user.username + 
        " with prefix " + client.botConfig.prefix);
    let statusMessage = "say " + client.botConfig.prefix + "help | Online";
    // Set the client user's presence
    client.user.setPresence({ activity: { name: statusMessage}, status: "online" })
    .catch(console.error);
});

// Dynamically load commands from commands directory
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
    console.log("Adding new command " + command.name + " from file \"" + file + "\"");
	client.commands.set(command.name, command);
}
// Dynamically run commands
client.on('message', message => {
	const prefix = client.botConfig.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) {
		console.error("Unknown command: " + command);
		message.channel.send('I do not know what ' + command + ' means.');
		return;
	} 

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.channel.send('There was an error trying to execute ' + command.name);
	}
});

// Log the bot in using the token provided in the config file
client.login(client.botConfig.token)
.catch((err) => {
    console.log(`Failed to authenticate with Discord network: "${err.message}"`)
});