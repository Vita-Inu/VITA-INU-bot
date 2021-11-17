import { RPCResponse} from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs"
import { getLogger } from '../logger';
import { getAccountBalance } from '../vite_functions';

const logger = getLogger();

const Config = require('../../config.json');    // Loads the configuration values
const tokenID : string = Config.tti;

module.exports = {
	name: 'balance',
    aliases: ["bal","b"],
	description: 'Display Vite Inu balance for specified address',
	execute(message, args) {    
        let prefix = message.client.botConfig.prefix; 
        let address = "";
        // User passes in address
        if(args.length != 1) {
            message.channel.send("Usage: " + prefix + "balance <address>");
            return;
        } 
        address = args[0];
        if(vite.wallet.isValidAddress(address) == vite.wallet.AddressType.Illegal) {
            let errorMsg : string = "Invalid address \"" + address + "\"";
            message.channel.send(errorMsg);
            logger.error(errorMsg);
            return;
        }
        console.log("Looking up balance info for address: " + address);
        // Get account info for address
        showAccountBalance(message, address)
        .catch(error => {
            let errorMsg : string = "Error while grabbing balances for " + address + " :" + error;
            message.channel.send(errorMsg);
            console.error(errorMsg);
            logger.error(errorMsg);
        });
	},
};

const showAccountBalance = async (message, address: string) => {
    // Get balance of devWallet
    let balance : number = await getAccountBalance(address, tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve account balance for " + address + " token " + tokenID + " : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });
    // Send to chat
    let chatMsg : string =  balance.toLocaleString('en-GB', {minimumFractionDigits: 2}) + " VINU";
    message.channel.send(chatMsg);
}
