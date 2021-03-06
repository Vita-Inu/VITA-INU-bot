import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { getTokenPriceByTokenID } from '../vite_functions';

const logger = getLogger();

const Config = require('../../config.json');    // Loads the configuration values
let vitaInuTokenId = Config.tokenID;

/*  Total Market Cap = Total Supply x Price */
module.exports = {
	name: 'price',
  aliases: ["p"],
	description: 'Display current price for tokenID',
	execute(message, args) {    
      let prefix = message.client.botConfig.prefix; 
      // Use Vite Inu as default
      let tokenID = vitaInuTokenId;
      // User passes in address
      if(args.length == 1) {
        // Use argument passed if
        tokenID = args[0].replace('@', '@​\u200b'); 
      } else if(args.length > 1) {
        message.channel.send("Usage: " + prefix + "circulating_market_cap [tokenID]");
        return;
      }
      console.log("Looking up price for tokenID: " + tokenID);
      // Get price for tokenID
      showPrice(message, tokenID)
      .catch(error => {
        tokenID = tokenID
        let errorMsg : string = "Error while looking up price for " + tokenID + " :" + error;
        message.channel.send(errorMsg);
        console.error(errorMsg);
        logger.error(errorMsg);
      });
	},
};

const showPrice = async (message, tokenID : string) => {
  // Look up price for tokenID
  let price  = await getTokenPriceByTokenID(tokenID).catch((res: RPCResponse) => {
    let errorMsg = "Could not get price for " + tokenID;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error;
  });
  // Send to chat
  let chatMsg : string = "Price of " + tokenID + " is " + price;
  message.channel.send(chatMsg);
}