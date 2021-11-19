import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { getTokenName, getTotalSupply } from '../vite_functions';

const logger = getLogger();

const Config = require('../../config.json');    // Loads the configuration values
const vitaInuTTI = Config.tti;
const vitaInuTokenId = Config.tokenID;

module.exports = {
	name: 'total',
  aliases: ["ttl","t"],
	description: 'Display total supply for tokenID',
	execute(message, args) {    
      let prefix = message.client.botConfig.prefix; 
      // Use Vite Inu as default
      let tokenID = vitaInuTTI;
      // User passes in address
      if(args.length == 1) {
        // Use argument passed if
        tokenID = args[0].replace('@', '@​\u200b'); 
      } else if(args.length > 1) {
        message.channel.send("Usage: " + prefix + "total [tokenID]");
        return;
      }
      console.log("Looking up total supply for tokenID: " + tokenID);
      // Get total supply for tokenID
      showTotalSupply(message, tokenID)
      .catch(error => {
        let errorMsg : string = "Error while looking up total supply for " + tokenID + " :" + error;
        message.channel.send(errorMsg);
        console.error(errorMsg);
        logger.error(errorMsg);
      });
	},
};

const showTotalSupply = async (message, tokenID : string) => {
  // Get total supply for token ID
  let totalSupply : number = await getTotalSupply(tokenID).catch((res: RPCResponse) => {
    let errorMsg = "Could not retrieve total supply for " + tokenID;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error;
  });
  // Send to chat
  let chatMsg : string = "Total supply for " + vitaInuTokenId + " is " + totalSupply.toLocaleString('en-GB', {minimumFractionDigits: 2}) ;
  message.channel.send(chatMsg);
}