import { convertEnvsToURL } from "./stakerConfig.js";
import axios from "axios";

// TODO: this should be imported from @dappnode/types
const urls = convertEnvsToURL();

// gets the client URL for a given network and type (execution or consensus)
export function getClientUrl(network: string, type: "execution" | "consensus"): string | undefined {
    const clientUrls = {
        mainnet: {
            execution: urls.executionClientMainnetUrl ?? undefined,
            consensus: urls.consensusClientMainnetUrl ?? undefined,
        },
        prater: {
            execution: urls.executionClientPraterUrl ?? undefined,
            consensus: urls.consensusClientPraterUrl ?? undefined,
        },
        gnosis: {
            execution: urls.executionClientGnosisUrl ?? undefined,
            consensus: urls.consensusClientGnosisUrl ?? undefined,
        },
    };

    return clientUrls[network as keyof typeof clientUrls][type];
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
        const response = await axios.get(url)
        //TODO: reponse parse in another method, it wont always be in "is_syncing"
        return { response: response.data.is_syncing };
    } catch (error) {
        console.error((error as Error).message);
        return null;
    }
}
