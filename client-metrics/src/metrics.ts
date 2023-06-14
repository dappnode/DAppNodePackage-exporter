import { networks } from "@dappnode/types";
import promClient from "prom-client";
import express, { Request, Response } from "express";
import { getClientUrl, jsonRPCapiCall } from "./utils";

// Create a Registry which holds the metrics
const register = new promClient.Registry();

const executionSyncingMetric = new promClient.Gauge({
  name: "api_rpc_exec_syncing",
  help: "Whether the execution client is currently syncing or not, given by eth_syncing JSON-RPC API call",
  labelNames: ["network"],
  async collect() {
    await Promise.all(networks.map((network) => collectSyncingMetric(network, "execution")));
  },
});

const consensusSyncingMetric = new promClient.Gauge({
  name: "api_rpc_cons_syncing",
  help: "Whether the consensus client is currently syncing or not, given by /etc/v1/node/syncing JSON-RPC API call",
  labelNames: ["network"],
  async collect() {
    await Promise.all(networks.map((network) => collectSyncingMetric(network, "consensus")));
  },
});

async function collectSyncingMetric(network: string, type: "execution" | "consensus") {
  const clientUrl = getClientUrl(network, type);
  if (!clientUrl) {
    console.warn(`${type} ClientUrl of network ${network} is null or undefined, skipping JSON-RPC call`);
    return;
  }

  const apiMethod = type === "execution" ? "eth_syncing" : "eth/v1/node/syncing";
  const response = await jsonRPCapiCall(clientUrl, apiMethod, network);

  if (response != null) {
    const isSyncing = response.response !== false ? 1 : 0;
    const metric = type === "execution" ? executionSyncingMetric : consensusSyncingMetric;
    metric.set({ network: network }, isSyncing);
  } else {
    const metric = type === "execution" ? executionSyncingMetric : consensusSyncingMetric;
    metric.set({ network: network }, NaN);
  }
}

register.registerMetric(executionSyncingMetric);
register.registerMetric(consensusSyncingMetric);

const app = express();

app.get("/metrics", async (req: Request, res: Response) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
    console.log("Metrics served");
  } catch (error) {
    console.error("Error collecting metrics:", error);
    res.status(500).end();
  }
});

export { app };
