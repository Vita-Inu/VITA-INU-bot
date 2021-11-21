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

// Total Market Cap = Total Supply x Price
export async function getTotalMarketCap(tti: string)  {
    console.log("Calculating total market cap for: " + tti);
    let totalSupply : number = await getTotalSupply(tti)
        .catch((res: RPCResponse) => {
            let errorMsg = "Could not get total market cap for  " + tti;
            logger.error(errorMsg);
            console.log(errorMsg, res);
            throw res.error;
        });
    console.log("Total supply of " + tti + " : " + totalSupply);
    let price : number = await getTokenPriceByTTI(tti).catch((res: RPCResponse) => {
        let errorMsg = "Could not get price for " + tti;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error;
    });
    console.log("Price of " + tti + " : " + price);
    let totalMarketCap : number = totalSupply * price;
    console.log("Total market cap for " + tti + " is " + totalMarketCap);
    return totalMarketCap;
}

// Circulating Market Cap = Circulating Supply x Price
export async function getCirculatingMarketCap(tti: string)  {
    console.log("Calculating circulating market cap for: " + tti);
    let circulatingSupply = await getCirculatingSupply(tti)
        .catch((res: RPCResponse) => {
            let errorMsg = "Could not get circulating supply for  " + tti;
            logger.error(errorMsg);
            console.log(errorMsg, res);
            throw res.error;
        })
    console.log("Circulating supply for " + tti + " : " + circulatingSupply);
    let price : number = await getTokenPriceByTTI(tti).catch((res: RPCResponse) => {
        let errorMsg = "Could not get price for " + tti;
        logger.error(errorMsg);
        console.log(errorMsg, res);
        throw res.error;
    });
    console.log("Price of " + tti + " : " + price);
    try {
        let circulatingMarketCap = circulatingSupply * price;
        console.log("Circulating market cap for " + tti + " is " + circulatingMarketCap);
        return circulatingMarketCap;
    } catch(error) {
        console.error(error);
    }
}

// Get price by tokenID (i.e. VINU-001)
export async function getTokenPriceByTokenID(tokenID: string) : Promise<number> {
    return getTokenPrice("tokenSymbols",tokenID);
}

// Get price by tti (i.e. tti_541b25bd5e5db35166864096 )
export async function getTokenPriceByTTI(tti: string) : Promise<number> {
    return getTokenPrice("tokenIds",tti);
}

export async function getTokenPrice(paramName: string, token: string) : Promise<number> {
    // Form url to get price
    const priceUrl = "https://api.vitex.net/api/v2/exchange-rate?" + paramName + "=" + token;
    console.log("Fetching price data from " + priceUrl);
    return fetch(priceUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            if(json.code != 0) {
                throw new Error("Invalid Code " + json.code + " Msg: " + json.msg);
            }
            console.log("JSON returned: " + JSON.stringify(json));
            // Parse USD out of JSON
            if(json.data.length >= 1) {
                let data = json.data[0];
                return data.usdRate;
            } else {
                throw new Error("Could not find price data for " + token);
            }
        }) 
        .catch(function (error) {
            console.log(error);
        })
}

// Fetch circulating_supply from Not Thomiz node
export async function getCirculatingSupply(tti: string) : Promise<number> {
    // Form URL
    const apiUrl = "https://vite-api.thomiz.dev/supply/circulating/" + tti;
    console.log("Fetching circulating supply data from " + apiUrl);
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            if('circulating_supply' in json) {
                return json.circulating_supply;
            } else {
                throw new Error("circulating_supply not found in json. Json: " + 
                    JSON.stringify(json));
            }
        }) 
        .catch(function (error) {
            console.log(error);
        })
}

// Fetch total_supply from Not Thomiz node
export async function getTotalSupply(tti: string) : Promise<number> {
    // Form URL
    const apiUrl = "https://vite-api.thomiz.dev/supply/circulating/" + tti;
    console.log("Fetching total supply datafrom " + apiUrl);
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            if('total_supply' in json) {
                return json.total_supply;
            } else {
                throw new Error("total_supply not found in json. Json: " + 
                    JSON.stringify(json));
            }
        }) 
        .catch(function (error) {
            console.log(error);
        })
}

// @deprecated Use new function which uses Not Thomiz's endpoint
// Get total supply of tti
export async function _getTotalSupply(tti: string)  {
    console.log("Calculating total supply for: " + tti);
    // Get token info for specified tokenID
    const tokenInfo : TokenInfo = await getTokenInformation(tti).catch((res: RPCResponse) => {
        let errorMsg = "Could not retrieve token info for \"" + tti + "\" : " + res.error.message;
        logger.error(errorMsg);
        console.log(errorMsg);
        throw res.error;
    });
    if(tokenInfo == null) {
        console.log("No token information available for " + tti);
        return -1;
    } else {
        // Return total supply converted from raw
        let totalSupply : number = parseInt(tokenInfo.totalSupply);
        let decimals : number = parseInt(tokenInfo.decimals);
        return convertRaw(totalSupply, decimals);
    }
}

// @deprecated Use new function which uses Not Thomiz's endpoint
// Get circulating supply for tti. Need to provide dev wallet address.
// Circulating supply = total supply - dev wallet balance
export async function _getCirculatingSupply(tti: string, devWallet: string )  {
    console.log("Calculating circulating supply for: " + tti);
    try {
        // Get token info for specified tti
        console.log("Retrieving token info for " + tti)
        // Get total supply for token ID
        let totalSupply : number = await getTotalSupply(tti).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve total supply for " + tti;
            logger.error(errorMsg);
            console.log(errorMsg, res);
            throw res.error;
        });
        console.log("Total supply for " + tti + " is " + totalSupply);
        // Get balance of devWallet
        let devWalletBalance : number = await getAccountBalance(devWallet, tti).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve account balance for " + devWallet + " token " + tti + " : " + res.error.message;
            logger.error(errorMsg);
            console.log(errorMsg);
            throw res.error;
        });
        console.log("Dev wallet balance for " + devWallet + " is " + devWalletBalance);
        // ******************************************* REMOVE LATER ********************************
        // Get balance of tempWallet
        let tempWalletBalance : number = await getAccountBalance(tempWallet, tti).catch((res: RPCResponse) => {
            let errorMsg = "Could not retrieve account balance for " + tempWallet + " token " + tti + " : " + res.error.message;
            logger.error(errorMsg);
            console.log(errorMsg);
            throw res.error;
        });
        console.log("Temp wallet balance for " + tempWallet + " is " + tempWalletBalance);
        // Return circulating supply = total supply - dev wallet
        return totalSupply - devWalletBalance - tempWalletBalance;
    } catch(error) {
        const errorMsg = "Error getting circulating supply for " + devWallet + " token " + tti + " : " + error;
        logger.error(errorMsg);
        console.error(errorMsg);
        throw error;
    }
}