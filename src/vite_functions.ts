import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { convertRaw } from './common';
import { viteClient } from './index';
import { getLogger } from './logger';
import { AccountInfo, BalanceInfo} from './viteTypes';

const logger = getLogger();

export async function getTokenInformation(tokenID: string)  {
    try {
        const tokenInfo: TokenInfo = await viteClient.request('contract_getTokenInfoById', tokenID);
        return tokenInfo;
    } catch(error) {
        const errorMsg = "Error while calling contract_getTokenInfoById \"" + tokenID + "\" : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}

export async function getAccountInformation(address: string)  {
    try {
        const accountInfo: AccountInfo = await viteClient.request('ledger_getAccountInfoByAddress', address);
        return accountInfo;
    } catch(error) {
        const errorMsg = "Error while calling ledger_getAccountInfoByAddress \"" + address + "\" : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}

export async function getAccountBalance(address: string, tokenID: string)  {
    // Get account info for address
    let accountInfo : AccountInfo = await getAccountInformation(address).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve account balances for " + address;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error;
    });
    try {
        if(accountInfo == null) {
            console.log("No information for account " + address);
            return -1;
        } else {
            // Grab balanceInfoMap
            let balanceInfoMap : ReadonlyMap<String, BalanceInfo> = accountInfo.balanceInfoMap;
            // Find match tokenID
            let balanceInfo : BalanceInfo = balanceInfoMap[tokenID];
            let tokenInfo : TokenInfo = balanceInfo.tokenInfo;
            let decimals = parseInt(tokenInfo.decimals);
            let balance = parseFloat(balanceInfo.balance);
            return convertRaw(balance, decimals);
        }
    } catch(err) {
        console.error("Error displaying balance info for " + address + " : " + err);
        console.error(err.stack);
    }
}

// Get total supply of tokenID
export async function getTotalSupply(tokenID: string)  {
    // Get token info for specified tokenID
    const tokenInfo : TokenInfo = await getTokenInformation(tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve token info for \"" + tokenID + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });
    if(tokenInfo == null) {
        console.log("No token information available for " + tokenID);
        return -1;
    } else {
        // Return total supply converted from raw
        let totalSupply : number = parseInt(tokenInfo.totalSupply);
        let decimals : number = parseInt(tokenInfo.decimals);
        return convertRaw(totalSupply, decimals);
    }
}

// Get circulating supply for tokenID. Need to provide dev wallet address.
// Circulating supply = total supply - dev wallet balance
export async function getCirculatingSupply(tokenID: string, devWallet: string )  {
    try {
        // Get token info for specified tokenID
        console.log("Retrieving token info for " + tokenID)
        // Get total supply for token ID
        let totalSupply : number = await getTotalSupply(tokenID).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve total supply for " + tokenID;
            logger.error(errorMsg);
            console.log(errorMsg, res);
            throw res.error;
        });
        console.log("Total supply for " + tokenID + " is " + totalSupply);
        // Get balance of devWallet
        let devWalletBalance : number = await getAccountBalance(devWallet, tokenID).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve account balance for " + devWallet + " token " + tokenID + " : " + res.error.message;
            logger.error(errorMsg);
            console.log(errorMsg);
            throw res.error;
        });
        console.log("Dev wallet balance for " + tokenID + " is " + devWalletBalance);
        // Return circulating supply = total supply - dev wallet
        return totalSupply - devWalletBalance;
    } catch(error) {
        const errorMsg = "Error getting circulating supply for " + devWallet + " token " + tokenID + " : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}
