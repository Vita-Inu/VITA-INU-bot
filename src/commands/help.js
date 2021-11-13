var Discord = require('discord.js');
module.exports = {
    name: 'help',
    description: 'Display list of commands',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute: function (message, args) {
        if (!args.length) {
            var prefix_1 = message.client.botConfig.prefix;
            var Discord_1 = require('discord.js');
            var embed_1 = new Discord_1.MessageEmbed();
            // For each command show "Name -> Description"
            embed_1.setTitle("Command List for Vite Node bot:");
            message.client.commands.forEach(function (command) {
                embed_1.addField("" + prefix_1 + command.name, "" + command.description, false);
            });
            return message.channel.send({ embed: embed_1 })["catch"](function (error) {
                console.error("Could not send help DM to " + message.channel.tag + ".\n", error);
            });
        }
    }
};
