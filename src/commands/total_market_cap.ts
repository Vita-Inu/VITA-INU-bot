import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { getTokenName, getTotalMarketCap, getTotalSupply } from '../vite_functions';

const logger = getLogger();

const Config = require('../../config.json');    // Loads the configuration values
const vitaInuTTI = Config.tti;
const vitaInuTokenId = Config.tokenID;

/*  Total Market Cap = Total Supply x Price */
module.exports = {
	name: 'total_market_cap',
  aliases: ["tmc","market_cap","mc"],
	description: 'Display total market cap for tokenID',
	execute(message, args) {    
      let prefix = message.client.botConfig.prefix; 
      // Use Vite Inu as default
      let tokenID = vitaInuTTI;
      // User passes in address
      if(args.length == 1) {
        // Use argument passed if
        tokenID = args[0].replace('@', '@​\u200b'); 
      } else if(args.length > 1) {
        message.channel.send("Usage: " + prefix + "total_market_cap [tokenID]");
        return;
      }
      console.log("Looking up total market cap for tokenID: " + tokenID);
      // Get total supply for tokenID
      showTotalMarketCap(message, tokenID)
      .catch(error => {
        tokenID = tokenID
        let errorMsg : string = "Error while looking up total market cap for " + tokenID + " :" + error;
        message.channel.send(errorMsg);
        console.error(errorMsg);
        logger.error(errorMsg);
      });
	},
};

const showTotalMarketCap = async (message, tti : string) => {
  // Get total supply for token ID
  let totalMarketCap : number = await getTotalMarketCap(tti).catch((res: RPCResponse) => {
    let errorMsg = "Could not retrieve total market cap for " + tti;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error.message;
  });
  // Send to chat
  let chatMsg : string = "Total market cap " + vitaInuTokenId + " is " + 
    totalMarketCap.toLocaleString('en-GB', {minimumFractionDigits: 2}) ;
  message.channel.send(chatMsg);
}