import { RPCResponse, TokenInfo } from '@vite/vitejs/distSrc/utils/type';
import * as vite from "@vite/vitejs";
import { convertRaw } from 'common';
import { viteClient } from './index';
import { getLogger } from './logger';

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