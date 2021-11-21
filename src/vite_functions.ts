import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import { convertRaw } from './common';
import { viteClient } from './index';
import { getLogger } from './logger';
import { AccountInfo, BalanceInfo} from './viteTypes';
import fetch from 'node-fetch';

const logger = getLogger();

// Cache for commonly looked up tokenIDs
var tokenNames = new Map();

const Config = require('../config.json');    // Loads the configuration values
const devWallet = Config.devWallet; 
const vitaInuTTI = Config.tti;
// TEMPORARY: To get circulating supply remove 2nd biggest wallet too
// Circulating Supply = Total Supply - Dev Wallet - vite_bff94cf2d417548492d0af26d1f2907992c32672a013370150
const tempWallet = "vite_e631e6b2bd389d971b83abd10315ad0cab6ad9e44c5d645391";

// Get TokenInfo for given tokenID
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

// Get token name for given tokenID
export async function getTokenName(tokenID: string)  {
    try {
        // Look up if value in cache
        if(tokenNames.has(tokenID)) {
            logger.info("getTokenName() - Returning cached value " + tokenNames.get(tokenID) + " for " + tokenID);
            return tokenNames.get(tokenID);
        } else {
            // Look up token info
            const tokenInfo: TokenInfo = await viteClient.request('contract_getTokenInfoById', tokenID);
            // Cache it for fast future lookup
            tokenNames.set(tokenID, tokenInfo.tokenName);
            logger.info("getTokenName() - Caching " + tokenInfo.tokenName + " for " + tokenID);
            return tokenInfo.tokenName;
        }
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
        console.log("Dev wallet balance for " + devWallet + " is " + devWalletBalance);
        // ******************************************* REMOVE LATER ********************************
        // Get balance of tempWallet
        let tempWalletBalance : number = await getAccountBalance(tempWallet, tokenID).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve account balance for " + tempWallet + " token " + tokenID + " : " + res.error.message;
            logger.error(errorMsg);
            console.log(errorMsg);
            throw res.error;
        });
        console.log("Temp wallet balance for " + tempWallet + " is " + tempWalletBalance);
        // Return circulating supply = total supply - dev wallet
        return totalSupply - devWalletBalance - tempWalletBalance;
    } catch(error) {
        const errorMsg = "Error getting circulating supply for " + devWallet + " token " + tokenID + " : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}

// Total Market Cap = Total Supply x Price
export async function getTotalMarketCap(tokenID: string)  {
    let totalSupply : number = await getTotalSupply(tokenID)
        .catch((res: RPCResponse) => {
            let errorMsg = "Could not get total supply for  " + tokenID;
            logger.error(errorMsg);
            console.log(errorMsg, res);
            throw res.error;
        });
    let price : number = await getTokenPrice(tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not get price for " + tokenID;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error;
    });
    let totalMarketCap : number = totalSupply * price;
    console.log("Total market cap for " + tokenID + " is " + totalMarketCap);
    return totalMarketCap;
}

// Circulating Market Cap = Circulating Supply x Price
export async function getCirculatingMarketCap(tokenID: string)  {
    let circulatingSupply : number = await getCirculatingSupply(tokenID,devWallet)
        .catch((res: RPCResponse) => {
            let errorMsg = "Could not get total supply for  " + tokenID;
            logger.error(errorMsg);
            console.log(errorMsg, res);
            throw res.error;
        });
    let price : number = await getTokenPrice(tokenID).catch((res: RPCResponse) => {
        let errorMsg = "Could not get price for " + tokenID;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error;
    });
    let circulatingMarketCap : number = circulatingSupply * price;
    console.log("Circulating market cap for " + tokenID + " is " + circulatingMarketCap);
    return circulatingMarketCap;
}

export async function getTokenPrice(tti: string)  {
    // Form url to get price
    const priceUrl = "https://api.vitex.net/api/v2/exchange-rate?tokenSymbols=" + tti;
    console.log("Fetching " + priceUrl)
    let usdPrice = -1;
    fetch(priceUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Response not OK : " + response.status);
                throw new Error("HTTP error " + response.status);
            }
            return -1;
        })
        .then(json => {
            console.log("Fetch " + priceUrl + " Response Code : " + json.code + " MSG: " + json.msg);
            if(json.code == 0) {
                // Parse USD out of JSON
                console.log("JSON data length : " + json.data.length);
                if(json.data.length >= 1) {
                    let data = json.data[0];
                    console.log("USD Rate of :" + data.usdRate);
                    usdPrice = data.usdRate;
                } else {
                    console.log("Could not find price data for " + tti);
                }
            } else {
                let errorMsg = "Fetch " + priceUrl + " Response Code : " + json.code + " MSG: " + json.msg;
                logger.error(errorMsg);
                console.log(errorMsg);
            } 
            return usdPrice;
        })
        .catch(function (error) {
            console.log(error);
            return -1;
        })
}
