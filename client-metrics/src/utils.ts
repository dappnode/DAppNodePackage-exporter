import { getUrlFromDnpName } from "@dappnode/types";
import { networks } from "@dappnode/types";
import axios from "axios";

const urls = getUrlFromDnpName();

// Define the URL mappings for execution and consensus clients
const urlsMap = {
    execution: {
        mainnet: urls.executionClientMainnetUrl,
        prater: urls.executionClientPraterUrl,
        gnosis: urls.executionClientGnosisUrl,
        lukso: urls.executionClientLuksoUrl,
    },
    consensus: {
        mainnet: urls.consensusClientMainnetUrl,
        prater: urls.consensusClientPraterUrl,
        gnosis: urls.consensusClientGnosisUrl,
        lukso: urls.consensusClientLuksoUrl,
    },
};

// Gets the client URL for a given network and type (execution or consensus)
export function getClientUrl(network: typeof networks[number], type: "execution" | "consensus"): string | undefined {
    const clientUrl = urlsMap[type][network];
    return clientUrl !== undefined ? clientUrl : undefined;
}

export async function jsonRPCapiCallExecution(
    url: string,
    APImethod: string,
    responseParser: (data: any) => any,
    params?: string[]
): Promise<{ response: any } | null> {
    const data = JSON.stringify({
        jsonrpc: "2.0",
        method: APImethod,
        params: params,
        id: 0,
    });

    const config = {
        method: "post",
        url: url,
        headers: {
            "Content-Type": "application/json",
        },
        data: data,
    };

    try {
        console.log("Calling ", url);
        const response = await axios(config);
        return { response: responseParser(response.data) }; // Use the response parser callback
    } catch (error) {
        console.error((error as Error).message);
        return null;
    }
}

export async function jsonRPCapiCallConsensus(
    baseURL: string,
    endpoint: string,
    responseParser: (data: any) => any // Response parser callback
): Promise<{ response: any } | null> {
    try {
        const url = `${baseURL}${endpoint}`;

        console.log("Calling ", url);
        const response = await axios.get(url);
        return { response: responseParser(response.data) }; // Use the response parser callback
    } catch (error) {
        console.error((error as Error).message);
        return null;
    }
}

// Response parser for execution API call
export function executionSyncingParser(data: any): any {
    // Expecting response in the form of { "result": true/false }
    return data.result;
}

// Response parser for consensus API call
export function consensusSyncingParser(data: any): any {
    // Expecting response in the form of { "data": { "is_syncing": true/false } }
    return data.data.is_syncing;
}

// Response parser for execution API call
export function executionPeerParser(data: any): any {
    // Expecting response in the form of { "result": "0x2" }
    // Convert the hexadecimal result to an integer
    return parseInt(data.result, 16);
  }
  
  // Response parser for consensus API call
export function consensusPeerParser(data: any): any {
    // Expecting response in the form of { "data": { "connected": "56" } }
    // Parsing the "connected" field and converting it to an integer
    return parseInt(data.data.connected, 10);
  }