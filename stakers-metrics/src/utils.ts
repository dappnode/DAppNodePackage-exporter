import { networks, getJsonRpcApiFromDnpName } from "@dappnode/types";
import axios, { AxiosError } from "axios";
import logger from "./logger.js"; 

/**
 * Gets the client URL for a given network and type (execution or consensus).
 * @param network - The network for which the client URL is required.
 * @param type - The type of client (execution or consensus).
 * @returns The client URL for the specified network and type, or undefined if not found.
 */
export function getClientUrl(network: typeof networks[number], type: "execution" | "consensus"): string | undefined {
  // Get the environment variable key for the specified type and network.
  const envKey = `_DAPPNODE_GLOBAL_${type.toUpperCase()}_CLIENT_${network.toUpperCase()}`;

  // Check if the environment variable is defined.
  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    // Call the appropriate function to get the complete URL.
    const clientUrl = getJsonRpcApiFromDnpName(envValue)

    // Return the complete client URL.
    return clientUrl;
  }

  // Return undefined if environment variable is not defined.
  return undefined;
}

export async function jsonRPCapiCallExecution(
    url: string,
    APImethod: string,
    responseParser: (data: any) => any,
    params?: string[]
  ): Promise<{ response: any } | null> {
    try {
      logger.debug(`Calling ${url}`);
      const response = await axios.post(url, {
        jsonrpc: "2.0",
        method: APImethod,
        params: params || [],
        id: 0,
      });
      return { response: responseParser(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.debug(`Error calling ${url}: ${axiosError.message}`);
      return null;
    }
  }
  
  export async function jsonRPCapiCallConsensus(
    baseURL: string,
    endpoint: string,
    responseParser: (data: any) => any
  ): Promise<{ response: any } | null> {
    const url = `${baseURL}${endpoint}`;
    try {
      logger.debug(`Calling ${url}`);
      const response = await axios.get(url);
      return { response: responseParser(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.debug(`Error calling ${url}: ${axiosError.message}`);
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