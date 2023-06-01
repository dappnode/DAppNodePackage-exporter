import { convertEnvsToURL } from "./stakerConfig.js";
import promClient from "prom-client";
import axios from "axios";
import { networks } from "@dappnode/types"
import express, { Request, Response } from "express";

// Create a Registry which holds the metrics
const register = new promClient.Registry();

//TODO: this should be imported from @dappnode/types
const urls = convertEnvsToURL();

async function jsonRPCapiCall(APImethod: string, network: string, params?: string[]): Promise<{ response: any } | null> {
  const data = JSON.stringify({
    jsonrpc: "2.0",
    method: APImethod,
    params: params,
    id: 0,
  });

  const executionClientUrl = getExecutionClientUrl(network);

  if (!executionClientUrl) {
    console.warn("executionClientUrl of network" + network + " is null or undefined, skipping JSON-RPC call");
    return null; // Skip this network if the URL is null or undefined
  }

  const config = {
    method: "post",
    url: executionClientUrl,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    console.log("Calling ", executionClientUrl);
    const response = await axios(config);
    return { response: response.data.result };
  } catch (error) {
    console.error((error as Error).message); // Log the error message for debugging. TODO: improve service logs overall
    return null; //return null if the call fails
  }
}

// gets the execution client URL for a given network
function getExecutionClientUrl(network: string): string | undefined {
  const executionClientUrls = {
    mainnet: urls.executionClientMainnetUrl ?? undefined,
    prater: urls.executionClientPraterUrl ?? undefined,
    gnosis: urls.executionClientGnosisUrl ?? undefined,
  };

  return executionClientUrls[network as keyof typeof executionClientUrls];
}

// Collects the eth_syncing result for a given network
async function collectEthSyncingMetric(network: string) {
  const response = await jsonRPCapiCall("eth_syncing", network);
  if (response != null) {
    const isSyncing = response.response !== false ? 1 : 0;
    ethSyncingMetric.set({ network: network }, isSyncing);
  }
  else {
    // If the call fails, set the metric to NaN so prometheus
    // knows the value could not be collected
    ethSyncingMetric.set({ network: network }, NaN);
  }
}

const ethSyncingMetric = new promClient.Gauge({
  name: "api_rpc_eth_syncing",
  help: "Whether the node is currently syncing or not, given by eth_syncing JSON-RPC API call",
  labelNames: ["network"],
  async collect() {
    // Collect the eth_syncing metric for each network
    await Promise.all(networks.map(collectEthSyncingMetric));
  },
});

// Register the metric in the prometheus registry
register.registerMetric(ethSyncingMetric);

const app = express();

// Expose a single endpoint for prometheus to scrape, this should always return all metrics
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    res.set("Content-Type", register.contentType);

    // Collects all metrics of the registry "register"
    res.end(await register.metrics());
    console.log("Metrics served"); //TODO: prettier logging
  } catch (error) {
    console.error("Error collecting metrics:", error); //TODO: better error handling
    res.status(500).end();
  }
});

export { app };
