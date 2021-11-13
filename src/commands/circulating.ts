import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { getCirculatingSupply } from '../vite_functions';

const logger = getLogger();

const Config = require('../../config.json');    // Loads the configuration values
const devWallet = Config.devWallet; 
const vitaInuTTI = Config.tti;

module.exports = {
	name: 'circulating',
  aliases: ["c","cir"],
	description: 'Display circulating supply for tokenID',
	execute(message, args) {    
      let prefix = message.client.botConfig.prefix; 
      // Use Vite Inu as default
      let tokenID = vitaInuTTI;
      // User passes in address
      if(args.length == 1) {
        // Use argument passed if
        tokenID = args[0];
      } else if(args.length > 1) {
        message.channel.send("Usage: " + prefix + "circulating [tokenID]");
        return;
      }
      console.log("Looking up circulalting supply for tokenID: " + tokenID);
      // Get circulating supply for tokenID
      showCirculatingSupply(message, tokenID)
      .catch(error => {
        let errorMsg : string = "Error while looking up circulating supply for " + tokenID + " :" + error;
        message.channel.send(errorMsg);
        console.error(errorMsg);
        logger.error(errorMsg);
      });
	},
};

const showCirculatingSupply = async (message, tokenID : string) => {
  // Get circulating supply for token ID
  let circulatingSupply : number = await getCirculatingSupply(tokenID,devWallet).catch((res: RPCResponse) => {
    let errorMsg = "Could not retrieve circulating supply for " + tokenID;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error;
  });
  let chatMsg : string = "Circulating supply for " + tokenID + " is " + circulatingSupply.toLocaleString('en-GB', {minimumFractionDigits: 2}) ;
  message.channel.send(chatMsg);
}