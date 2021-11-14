// Temp function will rm later

import { convertToBorks } from "../common";

module.exports = {
  name: 'convert',
  description: 'Convert to borks. For testing will probably remove later',
  execute(message, args) {
    let prefix = message.client.botConfig.prefix; 
    let amountString : string;
    let amount : number;
    // User passes in address
    if(args.length != 1) {
        message.channel.send("Usage: " + prefix + "convert <number>");
        return;
    } 
    // Strip commas out of amount 
    amountString = args[0];
    console.log("Convert: " + amountString);
    amountString = amountString.split(',').join('');
    console.log("Stripped: " + amountString);
    amount = parseInt(amountString);
    console.log("To int: " + amount);
    let converted = convertToBorks(amount); 
      message.channel.send(amount + " -> " + converted);
  },
};