import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { getCirculatingMarketCap, getTokenName, getTotalSupply } from '../vite_functions';

const logger = getLogger();

const Config = require('../../config.json');    // Loads the configuration values
const vitaInuTTI = Config.tti;
const vitaInuTokenId = Config.tokenID;

/*  Total Market Cap = Total Supply x Price */
module.exports = {
	name: 'circulating_market_cap',
  aliases: ["cmc","circulating_cap"],
	description: 'Display circulating market cap for tokenID',
	execute(message, args) {    
      let prefix = message.client.botConfig.prefix; 
      // Use Vite Inu as default
      let tokenID = vitaInuTTI;
      // User passes in address
      if(args.length == 1) {
        // Use argument passed if
        tokenID = args[0].replace('@', '@​\u200b'); 
      } else if(args.length > 1) {
        message.channel.send("Usage: " + prefix + "circulating_market_cap [tokenID]");
        return;
      }
      console.log("Looking up circulating market cap for tokenID: " + tokenID);
      // Get total supply for tokenID
      showCirculatingMarketCap(message, tokenID)
      .catch(error => {
        tokenID = tokenID
        let errorMsg : string = "Error while looking up circulating market cap for " + tokenID + " :" + error;
        message.channel.send(errorMsg);
        console.error(errorMsg);
        logger.error(errorMsg);
      });
	},
};

const showCirculatingMarketCap = async (message, tokenID : string) => {
  // Look up token name for easier readability
  let tokenName = await getTokenName(tokenID).catch((res: RPCResponse) => {
    let errorMsg = "Could not get token name for " + tokenID;
    logger.error(errorMsg, res);
    console.log(res);
  });
  let circulatingMarketCap = await getCirculatingMarketCap(tokenID).catch((res: RPCResponse) => {
    let errorMsg = "Could not retrieve circulating market cap for " + tokenID;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error.message;
  });
  // Send to chat
  let chatMsg : string = "Circulating market cap for " + tokenName + " is " + 
    circulatingMarketCap.toLocaleString('en-GB', {minimumFractionDigits: 2});
  message.channel.send(chatMsg);
}