import { HTTP_RPC } from '@vite/vitejs-http';
import { getLogger } from '../logger';
import { viteClient } from '../index';

const logger = getLogger();

module.exports = {
	name: 'mode',
    aliases: ["m"],
	description: 'Set which network to connect to',
	execute(message, args) {
        const fs = require('fs');                   // Loads the Filesystem library
        const oldConfig = require('../../config.json');   // Loads bot config file
        if(!args.length) {
            const mode  = oldConfig.network;
            // No new prefix. Output usage
            message.channel.send("Currently in " + mode);
            return;
        }

        // Read in new mode
        const newMode = args[0];
        if(! (newMode == "TESTNET" || newMode == "MAINNET")) {
            message.channel.send("Invalid network");
            message.channel.send("Usage: " + oldConfig.prefix + "mode [TESTNET | MAINNET]");
            return;
        }

        // Create new config
        var newConfig = {
            token: oldConfig.token,
            prefix: oldConfig.prefix,
            network: newMode
        };

        try {
            // Write new config 
            fs.writeFileSync("config.json", JSON.stringify(newConfig, null, 2), function(err, result) {
                if (err) throw err;
            });
        } catch(e) {
            let errorMsg = "Error writing new config.json: " + e;
            logger.error(errorMsg);
            logger.error(e.stack);
            console.error(errorMsg);
            console.error(e.stack);
            message.channel.send("Could not set new command prefix: " + e);
        }


        try {
            // Reload config
            console.log("Setting new mode to " + newMode);
            // Reload config.json here
            delete require.cache[require.resolve('../../config.json')]   // Delete cache
            var config = require("../../config.json");
            var RPC_NET = process.env.TESTNET;  // Default to TESTNET
            if(newMode == 'MAINNET') {
                console.log("Loading MAINNET");
                RPC_NET = process.env.MAINNET;
            } else if(newMode == 'TESTNET') {
                console.log("Loading TESTNET");
                RPC_NET = process.env.TESTNET;
            } else {
                console.log("Invalid network specified. Please check config.json.");
            }
            const httpProvider = new HTTP_RPC(RPC_NET);
            viteClient.setProvider(httpProvider, () => {
                let infoMsg = "Vite client successfully reconnected to " + newMode;
                logger.info(infoMsg);
                console.log(infoMsg);
            }, true);

            // Reload bot
            message.channel.send("Switching to " + newMode)
            .then(msg => message.client.destroy())
            .then(() => message.client.botConfig = config)
            .then(() => message.client.login(config.token)
            .then(() => { 
                let statusMessage = "say " + message.client.botConfig.prefix + "help | Online";
                // Set the client user's presence
                message.client.user.setPresence({ activity: { name: statusMessage}, status: "online" })
                .catch(console.error);
            }));
        } catch(e) {
            console.error("Error reloading bot: " + e);
            console.error(e.stack);
            message.channel.send("Could not reload bot with new config.json: " + e);
        }
	},
};