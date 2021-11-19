import { HTTP_RPC } from '@vite/vitejs-http';
import { WS_RPC } from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';
import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getCirculatingSupply, getTotalSupply } from './vite_functions';
import { convertToBorks } from './common';

const fs = require('fs');                   // Loads the Filesystem library
const Discord = require('discord.js');      // Loads the discord API library
const Config = require('../config.json');    // Loads the configuration values

const client = new Discord.Client(); // Initiates the client
client.botConfig = Config; // Stores the config inside the client object so it's auto injected wherever we use the client
client.botConfig.rootDir = __dirname; // Stores the running directory in the config so we don't have to traverse up directories.
client.aliases = new Discord.Collection()

// Info for lookup
const tokenID = Config.tti;	// TTI of token we're watching
const updateInverval = Config.interval;	// How often to update circulating supply (ms)
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
});

// Call update circuling supply every updateInterval ms
setInterval(async () => {
	await updateCirculatingSupply();
}, updateInverval);

const updateCirculatingSupply = async () => {
	// Get circulating supply for token ID
	let circulatingSupply : number = await getCirculatingSupply(tokenID,devWallet).catch((res: RPCResponse) => {
		let errorMsg = "Could not retrieve circulating supply for " + tokenID;
		console.log(errorMsg, res);
		throw res.error;
	});
	// Get total supply for token ID
	let totalSupply : number = await getTotalSupply(tokenID).catch((res: RPCResponse) => {
		let errorMsg = "Could not retrieve total supply for " + tokenID;
		console.log(errorMsg, res);
		throw res.error;
	});
	// Calculate percentage of circulating out of total 
  // Might need to look into special lib cuz JS sucks at floating points
  let percentage : number = ( circulatingSupply / totalSupply ) * 100;
	// If over 1 trillion convert to teraborks
	let circulatingSupplyStr = circulatingSupply.toLocaleString('en-GB', {minimumFractionDigits: 2}); 
	if(circulatingSupply > 1e9) {
		circulatingSupplyStr = convertToBorks(circulatingSupply);
	} 
	let statusString = circulatingSupplyStr + " [" + percentage.toFixed(2) + "%]";
	//console.log("Updating status to \"" + statusString + "\"");
	// Set the client user's presence
	client.user.setPresence({ activity: { name: statusString, type: 'WATCHING' }, status: "online" })
	.catch(console.error);
}

// Dynamically load commands from commands directory
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	// Grab command
	const command = require(`./commands/${file}`);
	const commandName = file.split(".")[0];
  console.log("Adding new command " + commandName + " from file \"" + file + "\"");
	client.commands.set(commandName, command);
	// Add aliases if there are any
	if (command.aliases) {
			console.log("Aliases found for " + command.name);
			command.aliases.forEach(alias => {
				console.log("Adding alias " + alias + " for " + command.name);
					client.aliases.set(alias, command);
			});
	};
}

// Dynamically run commands
client.on('message', message => {
	// Grab and watch for our prefix
	const prefix = client.botConfig.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	// Parse user input
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	var input : string = args.shift().toLowerCase().replace(/@/g, "_");
	// Check if it has this command
	if (!client.commands.has(input) && !client.aliases.has(input)) {
		// Command not found. Report an error and return
		console.error("Unknown command: " + input);
		message.channel.send('I do not know what ' + input + ' means.');
		return;
	} 
	// Grab command and execute it
	try {
		var command = client.commands.get(input) || client.aliases.get(input); 
		command.execute(message, args);
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