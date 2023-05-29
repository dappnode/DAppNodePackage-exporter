import { convertEnvsToURL } from "./stakerConfig.js";
import promClient from "prom-client";
import axios from "axios";
import express from "express";

const register = new promClient.Registry();
const urls = convertEnvsToURL()

// Function to make the axios call
async function jsonRPCapiCall(APImethod: string, params?: string[]) {
  const data = JSON.stringify({
    jsonrpc: "2.0",
    method: APImethod,
    params: params,
    id: 0,
  });

  const executionClientUrls = {
    mainnet: urls.executionClientMainnetUrl,
    prater: urls.executionClientPraterUrl,
    gnosis: urls.executionClientGnosisUrl,
  };

  const networks = ["mainnet", "prater", "gnosis"];

  const responses = await Promise.all(
    networks.map(async (network) => {
      const executionClientUrl = executionClientUrls[network as keyof typeof executionClientUrls];
      console.log("executionClientUrl", executionClientUrl);

      const config = {
        method: "post",
        url: executionClientUrl,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      try {
        const response = await axios(config);
        return { network, response: response.data.result };
      } catch (error) {
        return null; // Ignore the error and exclude it from the responses, so that the metric is not set
      }
    })
  );

  return responses;
}

const ethSyncingMetric = new promClient.Gauge({
  name: "eth_syncing_result",
  help: "Eth syncing result",
  labelNames: ["network"],
  async collect() {
    const responses = await jsonRPCapiCall("eth_syncing");
    for (const response of responses) {
      if (response != null) {
        const isSyncing = response.response !== false ? 1 : 0;
        this.set({ network: response.network }, isSyncing);
      }
    }
  },
});

register.registerMetric(ethSyncingMetric);

const app = express();

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
    console.log("Metrics served"); //TODO: prettier logging
  } catch (error) {
    console.error("Error collecting metrics:", error); //TODO: better error handling
    res.status(500).end();
  }
});

export { app };
