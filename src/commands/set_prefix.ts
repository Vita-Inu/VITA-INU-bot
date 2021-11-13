module.exports = {
	name: 'set_prefix',
    aliases: ["setp","prefix"],
	description: 'Set the bot prefix',
	execute(message, args) {
        const fs = require('fs');                   // Loads the Filesystem library
        const oldConfig = require('../../config.json');   // Loads bot config file
        var prefix = message.client.botConfig.prefix;

        console.log(message.author.username + " called set_prefix ");

        // Only people with Core and Dev roles can set the bot prefix
        const coreRole = message.guild.roles.cache.find(x => x.name === "Core");
        const devRole = message.guild.roles.cache.find(x => x.name === "Dev");

        // Check if roles are defined
        if(typeof coreRole === 'undefined' && typeof devRole === 'undefined') {
           let errorMsg : String = "Permission denied because Core and Dev roles are undefined";
           console.error(errorMsg);
           message.channel.send(errorMsg);
           return;
        }

        // Check that user has either role
        if((typeof coreRole !== 'undefined' && message.member.roles.cache.has(coreRole.id))
             || (typeof devRole !== 'undefined' && message.member.roles.cache.has(devRole.id))) {
            console.log(message.author.username + " has permission to change prefix");
            if(!args.length) {
                // No new prefix. Output usage
                message.channel.send("Usage: " + prefix + "set_prefix <new_prefix>");
                return;
            } else {
                // Read in new prefix
                var newPrefix = args[0];
                // Create new config
                var newConfig = {
                    token: oldConfig.token,
                    prefix: newPrefix,
                    network: oldConfig.network
                };
                // Write new config 
                try {
                    fs.writeFileSync("config.json", JSON.stringify(newConfig, null, 2), function(err, result) {
                        if (err) throw err;
                    });
                } catch(e) {
                    // Error updating config file
                    console.error("Error writing new config.json: " + e);
                    console.error(e.stack);
                    message.channel.send("Could not set new command prefix: " + e);
                }
                // Reload config
                try {
                    console.log("Setting new prefix to " + newPrefix);
                    // Reload config.json here
                    delete require.cache[require.resolve('../../config.json')]   // Delete cache
                    var config = require("../../config.json");
                    // Reload bot
                    message.channel.send("Set new command prefix to \"" + newPrefix + "\"")
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
            }
        } else {
            let errorMsg : String = "Permission denied because not member in Core or Dev";
            console.error(errorMsg);
            message.channel.send(errorMsg);
            return;
        }
	},
};