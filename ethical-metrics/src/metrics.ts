import { loadStakerConfig } from "./stakerConfig.js";
import promClient from "prom-client";
import axios from "axios";
import express from "express";

const register = new promClient.Registry();
const { network, executionClientUrl, beaconchainUrl } = loadStakerConfig();

const ethSyncingMetric = new promClient.Gauge({
  name: "eth_syncing_result",
  help: "Eth syncing result",
  labelNames: ["is_syncing"],
  async collect() {
    const data = JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_syncing",
      params: [],
      id: 0,
    });
    console.log(executionClientUrl);
    const config = {
      method: "post",
      url: "http://localhost:8545",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    if (response.data.result === false) {
      ethSyncingMetric.set({ is_syncing: response.data.result }, 0);
    } else {
      ethSyncingMetric.set({ is_syncing: response.data.result }, 1);
    }
  },
});

register.registerMetric(ethSyncingMetric);

const app = express();

app.get("/metrics", async (req, res) => {
  try {
    await register.metrics();
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error("Error collecting metrics:", error);
    res.status(500).end();
  }
});

export { app };
