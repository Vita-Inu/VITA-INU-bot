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
    try {
      // Strip commas out of amount 
      amountString = args[0].replace(/@/g, "_");
      console.log("Convert: " + amountString);
      amountString = amountString.split(',').join('');
      console.log("Stripped: " + amountString);
      amount = parseInt(amountString);
      if(isNaN(amount)) {
        message.channel.send(amountString + " is not a number");
        return;
      }
      console.log("To int: " + amount);
      let converted = convertToBorks(amount); 
      message.channel.send(amount + " -> " + converted);
    } catch(err) {
      message.channel.send("Invalid amount: " + amount);
    }
  },
};