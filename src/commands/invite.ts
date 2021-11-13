
const Config = require('../../config.json');   // Grab client_id and permissions from config.json
const client_id = Config.clientID;
const permissions = Config.permissions;

module.exports = {
	name: 'invite',
    aliases: ["inv","i"],
	description: 'Generate invite URL for Discord',
	execute(message, args) {
        console.log("Client ID: " + client_id);
        console.log("Permissions: " + permissions);
        if(client_id == undefined) {
            message.author.send("Cannot generate invite link because clientID is undefined in config.json");
            return;
        } else if(permissions == undefined) {
            message.author.send("Cannot generate invite link because permissions is undefined in config.json");
            return;
        } else {
            let url = "https://discord.com/api/oauth2/authorize?client_id=" + client_id + "&permissions=" + permissions + "&scope=bot";
            message.author.send("Open a browser and go to " + url);
        }
	},
};