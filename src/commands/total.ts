import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { getLogger } from '../logger';
import { convertRaw } from '../common';
import { getTotalSupply } from '../vite_functions';

const logger = getLogger();

module.exports = {
	name: 'total',
	description: 'Display total circulating supply for tokenID',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "total <tokenID>");
            return;
        } 
        let tokenID = args[0];
        console.log("Looking up total supply for tokenID: " + tokenID);
        // Get total supply for tokenID
        showTotalSupply(message, tokenID)
        .catch(error => {
          let errorMsg : string = "Error while total supply for " + tokenID + " :" + error;
          message.channel.send(errorMsg);
          console.error(errorMsg);
          logger.error(errorMsg);
        });
	},
};

const showTotalSupply = async (message, tokenID : string) => {

  // Get total supply for token ID
  let totalSupply = await getTotalSupply(tokenID).catch((res: RPCResponse) => {
    let errorMsg = "Could not retrieve total supply for " + tokenID;
    logger.error(errorMsg);
    console.log(errorMsg, res);
    throw res.error;
  });

  let chatMsg : string = "Total supply for " + tokenID + " is " + totalSupply;
  message.channel.send(chatMsg);

}