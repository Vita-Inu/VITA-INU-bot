
const Discord = require('discord.js');  

module.exports = {
    name: 'help',
    description: 'Display list of commands',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        if (!args.length) {

            let prefix = message.client.botConfig.prefix;

            const Discord = require('discord.js');
            const embed = new Discord.MessageEmbed();

            // For each command show "Name -> Description"
            embed.setTitle("Command List for Vite Node bot:");
            message.client.commands.forEach(command => {
                embed.addField(`${prefix}${command.name}`, `${command.description}`, false);
            });
   
            return message.channel.send({embed: embed})
               .catch(error => {
                  console.error(`Could not send help DM to ${message.channel.tag}.\n`, error);
               });
         }
    }
};