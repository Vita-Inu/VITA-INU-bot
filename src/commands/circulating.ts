import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { getCirculatingSupply } from '../vite_functions';

const Config = require('../../config.json');    // Loads the configuration values

const logger = getLogger();
const devWallet = Config.devWallet; 

module.exports = {
	name: 'circulating',
	description: 'Display circulating supply for tokenID',
	execute(message, args) {    
      let prefix = message.client.botConfig.prefix; 
      // User passes in address
      if(args.length != 1) {
          message.channel.send("Usage: " + prefix + "circulating <tokenID>");
          return;
      } 
      let tokenID = args[0];
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