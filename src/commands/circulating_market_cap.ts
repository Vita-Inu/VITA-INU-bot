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
      let tti = vitaInuTTI;
      // User passes in address
      if(args.length == 1) {
        // Use argument passed if
        tti = args[0].replace('@', '@​\u200b'); 
      } else if(args.length > 1) {
        message.channel.send("Usage: " + prefix + "circulating_market_cap [tokenID]");
        return;
      }
      console.log("Looking up circulating market cap for tokenID: " + tti);
      // Get total supply for tokenID
      showCirculatingMarketCap(message, tti)
      .catch(error => {
        let errorMsg : string = "Error while looking up circulating market cap for " + tti + " :" + error;
        message.channel.send(errorMsg);
        console.error(errorMsg);
        logger.error(errorMsg);
      });
	},
};

const showCirculatingMarketCap = async (message, tti : string) => {
  let circulatingMarketCap = await getCirculatingMarketCap(tti).catch((res: RPCResponse) => {
    let errorMsg = "Could not retrieve circulating market cap for " + tti;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error.message;
  });
  // Send to chat
  let chatMsg : string = "Circulating market cap for " + vitaInuTokenId + " is " + 
    circulatingMarketCap.toLocaleString('en-GB', {minimumFractionDigits: 2});
  message.channel.send(chatMsg);
}