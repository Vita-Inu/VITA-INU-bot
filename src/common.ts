import {getLogger } from './logger';
import {DateTime} from 'luxon';

const logger = getLogger();
const VITE_DECIMALS = 18;

export const getTodayForFilename = () => {
    return DateTime.now().toFormat("yyyy-MM-dd");
}

export const getYYMMDD = () => {
    return DateTime.now().toFormat('yyyyMMddHHMMss');
};

export const epochToDate = (epoch) => {
    let d  = new Date(0);
    d.setUTCSeconds(epoch);
    return d;
};

export const convertRaw = (amount : number, decimals : number) => {
    if(amount == 0 || decimals == 0) {
        return 0;
    } else {
        return amount / Math.pow(10, decimals);
    }
};

export const convertRawToVite = (amount : number) => {
    return convertRaw(amount, VITE_DECIMALS);
};

export const convertToBorks = (amount : number) : string => {
    let returnString : string = "";
    let prefix : string = "";
    let coString : string = "";
    let co : number;
    //console.log("convertToBorks: ", amount);
    if(amount >= 1e24) {
        co = amount / 1e24;
        prefix = "Y";
    } else if(amount >= 1e21) {
        co = amount / 1e18;
        prefix = "Z";
    } else if(amount >= 1e18) {
        co = amount / 1e18;
        prefix = "E";
    } else if(amount >= 1e15) {
        co = amount / 1e15;
        prefix = "P";
    } else if(amount >= 1e12) {
        co = amount / 1e12;
        prefix = "T";
    } else if(amount >= 1e9) {
        co = amount / 1e9;
        prefix = "G";
    } else if(amount >= 1e6) {
        co = amount / 1e6;
        prefix = "M";
    } else {
        // Don't convert 
        co = amount;
        prefix = "";
    }
    // Show 2 decimals for coefficient
    //console.log("co: ", co);
    coString = co.toLocaleString('en-GB', {minimumFractionDigits: 4})
    //console.log("after locale co: ", coString);
    returnString = coString + prefix;
    return returnString;
};

export const quotaToUT = (quota) => {
    return quota / 21000
};

// Returns true if address is valid. False if invalid
export const isValidAddress = (address : string) => {
    // Check if empty string
    if(address == "") return false;
    // Check if correct length
    if(address.length != 55) return false;
    // Check if starts with "vite_"
    if(! address.startsWith("vite_")) return false;
    // Else return true
    return true;
};