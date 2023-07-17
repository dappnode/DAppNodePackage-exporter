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

export async function jsonRPCapiCallExecution(url: string, APImethod: string, params?: string[]): Promise<{ response: any } | null> {
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
        //TODO: reponse parse in another method, it wont always be in "result"
        return { response: response.data.result };
    } catch (error) {
        console.error((error as Error).message);
        return null;
    }
}

export async function jsonRPCapiCallConsensus(baseURL: string, endpoint: string): Promise<{ response: any } | null> {
    try {
        const url = `${baseURL}${endpoint}`;

        console.log("Calling ", url);
        const response = await axios.get(url);
        //TODO: reponse parse in another method, it wont always be in "is_syncing"
        return { response: response.data.is_syncing };
    } catch (error) {
        console.error((error as Error).message);
        return null;
    }
}
