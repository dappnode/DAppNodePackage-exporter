import { networks } from "@dappnode/types";
import promClient from "prom-client";
import express, { Request, Response } from "express";
import { getClientUrl, jsonRPCapiCallExecution, jsonRPCapiCallConsensus, consensusSyncingParser, executionSyncingParser, executionPeerParser, consensusPeerParser } from "./utils.js";

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
  help: "Whether the consensus client is currently syncing or not, given by /eth/v1/node/syncing JSON-RPC API call",
  labelNames: ["network"],
  async collect() {
    await Promise.all(networks.map((network) => collectSyncingMetric(network, "consensus")));
  },
});

const consensusPeerCountMetric = new promClient.Gauge({
  name: "api_rpc_cons_peers",
  help: "Number of peers connected to consensus client, given by /eth/v1/node/peer_count JSON-RPC API call",
  labelNames: ["network"],
  async collect() {
    await Promise.all(networks.map((network) => collectPeerCount(network, "consensus")));
  },
});

const executionPeerCountMetric = new promClient.Gauge({
  name: "api_rpc_exec_peers",
  help: "Number of peers connected to consensus client, given by net_peercount JSON-RPC API call",
  labelNames: ["network"],
  async collect() {
    await Promise.all(networks.map((network) => collectPeerCount(network, "execution")));
  },
});

async function collectPeerCount(network: typeof networks[number], type: "execution" | "consensus") {
  const clientUrl = getClientUrl(network, type);
  if (!clientUrl) {
    console.warn(`${type} ClientUrl of network ${network} is null or undefined, skipping JSON-RPC call`);
    return;
  }

  let response = null;
  if (type === "execution") {
    const apiMethod = "net_peerCount";
    response = await jsonRPCapiCallExecution(clientUrl, apiMethod, executionPeerParser);
  } else {
    const apiMethod = "/eth/v1/node/peer_count";
    response = await jsonRPCapiCallConsensus(clientUrl, apiMethod, consensusPeerParser);
  }

  const peerCount = response != null ? response.response : NaN;
  const metric = type === "execution" ? executionPeerCountMetric : consensusPeerCountMetric;
  metric.set({ network: network }, peerCount);
}

async function collectSyncingMetric(network: typeof networks[number], type: "execution" | "consensus") {
  const clientUrl = getClientUrl(network, type);
  if (!clientUrl) {
    console.warn(`${type} ClientUrl of network ${network} is null or undefined, skipping JSON-RPC call`);
    return;
  }

  let response = null;
  if (type === "execution") {
    const apiMethod = "eth_syncing";
    response = await jsonRPCapiCallExecution(clientUrl, apiMethod, executionSyncingParser);
  } else {
    const apiMethod = "/eth/v1/node/syncing";
    response = await jsonRPCapiCallConsensus(clientUrl, apiMethod, consensusSyncingParser);
  }

  const isSyncing = response != null ? (response.response !== false ? 1 : 0) : NaN;
  const metric = type === "execution" ? executionSyncingMetric : consensusSyncingMetric;
  metric.set({ network: network }, isSyncing);
}

register.registerMetric(consensusPeerCountMetric);
register.registerMetric(executionPeerCountMetric);
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
