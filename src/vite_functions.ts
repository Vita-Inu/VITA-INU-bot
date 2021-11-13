import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs";
import { convertRaw } from 'common';
import { viteClient } from './index';
import { getLogger } from './logger';
import { AccountInfo, BalanceInfo} from 'viteTypes';

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
    
    let accountInfo: AccountInfo;
    let balanceInfoMap : ReadonlyMap<String, BalanceInfo>;

    // Get account info for address
    accountInfo = await getAccountInformation(address).catch((res: RPCResponse) => {
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
            balanceInfoMap = accountInfo.balanceInfoMap;
            // Find match tokenID
            let balanceInfo = balanceInfoMap[tokenID];
            return balanceInfo.balance;
        }
    } catch(err) {
        console.error("Error displaying balance info for " + address + " : " + err);
        console.error(err.stack);
    }
}

// Get total supply of tokenID
export async function getTotalSupply(tokenID: string)  {
    // Get token info for specified tokenID
    const tokenInfo = await getTokenInformation(tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve token info for \"" + tokenID + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });
    if(tokenInfo == null) {
        console.log("No token information available for " + tokenID);
        return -1;
    } else {
        // Return total supply
        return tokenInfo.totalSupply;
    }
}

// Get circulating supply for tokenID. Need to provide dev wallet address.
// Circulating supply = total supply - dev wallet balance
export async function getCirculatingSupply(devWallet: string, tokenID: string)  {
    try {
        // Get token info for specified tokenID
        var totalSupply;
        var devWalletBalance;
        const tokenInfo = await getTokenInformation(tokenID).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve token info for \"" + tokenID + "\" : " + res.error.message;
            logger.error(errorMsg);
            console.log(errorMsg);
            throw res.error;
        });
        if(tokenInfo == null) {
            console.log("No token information available for " + tokenID);
            return -1;
        } 
        // Get total supply
        totalSupply = tokenInfo.totalSupply;
        // Get balance of devWallet
        devWalletBalance = getAccountBalance(devWallet, tokenID);
        // Return circulating supply = total supply - dev wallet
        return totalSupply - devWalletBalance;
    } catch(error) {
        const errorMsg = "Error getting circulating supply for " + devWallet + " token " + tokenID + " : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}
