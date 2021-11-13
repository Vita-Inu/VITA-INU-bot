// Grab data from .env
require('dotenv').config();

// Grab files from .env
const CLIENT_ID = process.env.CLIENT_ID || '0';
const PERMISSIONS = process.env.PERMISSIONS || "198656";

module.exports = {
	name: 'invite',
	description: 'Generate invite URL for Discord',
	execute(message, args) {
        if(CLIENT_ID == '0') {
            message.channel.send("Cannot generate invite link because .env is missing CLIENT_ID");
            return;
        } else {
            let url = "https://discord.com/api/oauth2/authorize?client_id=" + CLIENT_ID + "&permissions=" + PERMISSIONS + "&scope=bot";
            message.author.send("Open a browser and go to " + url);
        }
	},
};