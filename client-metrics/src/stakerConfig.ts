import {
  ExecutionClientMainnet,
  ConsensusClientMainnet,
  ExecutionClientGnosis,
  ExecutionClientPrater,
  ConsensusClientPrater,
  ConsensusClientGnosis,

} from "@dappnode/types";

export function convertEnvsToURL() {
  const executionClientMainnet = process.env._DAPPNODE_GLOBAL_EXECUTION_CLIENT_MAINNET as ExecutionClientMainnet;
  const ConsensusClientMainnet = process.env._DAPPNODE_GLOBAL_CONSENSUS_CLIENT_MAINNET as ConsensusClientMainnet;
  const executionClientPrater = process.env._DAPPNODE_GLOBAL_EXECUTION_CLIENT_PRATER as ExecutionClientPrater;
  const ConsensusClientPrater = process.env._DAPPNODE_GLOBAL_CONSENSUS_CLIENT_PRATER as ConsensusClientPrater;
  const executionClientGnosis = process.env._DAPPNODE_GLOBAL_EXECUTION_CLIENT_GNOSIS as ExecutionClientGnosis;
  const ConsensusClientGnosis = process.env._DAPPNODE_GLOBAL_CONSENSUS_CLIENT_GNOSIS as ConsensusClientGnosis;

  let executionClientMainnetUrl: string,
    executionClientPraterUrl: string,
    executionClientGnosisUrl: string,
    consensusClientMainnetUrl: string,
    consensusClientPraterUrl: string,
    consensusClientGnosisUrl: string;

  switch(executionClientMainnet) {
    case "geth.dnp.dappnode.eth":
      executionClientMainnetUrl = `http://geth.dappnode:8545`;
      break;
    case "besu.public.dappnode.eth":
      executionClientMainnetUrl = `http://besu.public.dappnode:8545`;
      break;
    case "nethermind.public.dappnode.eth":
      executionClientMainnetUrl = `http://nethermind.public.dappnode:8545`;
      break;
    case "erigon.dnp.dappnode.eth":
      executionClientMainnetUrl = `http://erigon.dappnode:8545`;
      break;
   //TODO: add error handling, default case
  }
   switch(ConsensusClientMainnet) {
    case "prysm.dnp.dappnode.eth":
      consensusClientMainnetUrl = `http://beacon-chain.prysm.dappnode:3500`;
      break;
    case "lighthouse.dnp.dappnode.eth":
      consensusClientMainnetUrl = `http://beacon-chain.lighthouse.dappnode:3500`;
      break;
    case "teku.dnp.dappnode.eth":
      consensusClientMainnetUrl = `http://beacon-chain.teku.dappnode:3500`;
      break;
    case "nimbus.dnp.dappnode.eth":
      consensusClientMainnetUrl = `http://beacon-validator.nimbus.dappnode:4500`;
      break;
    case "lodestar.dnp.dappnode.eth":
      consensusClientMainnetUrl = `http://beacon-chain.lodestar.dappnode:3500`;
      break;
   }
    switch(executionClientPrater) {
      case "goerli-geth.dnp.dappnode.eth":
        executionClientPraterUrl = `http://goerli-geth.dappnode:8545`;
        break;
      case "goerli-besu.dnp.dappnode.eth":
        executionClientPraterUrl = `http://goerli-besu.dnp.dappnode:8545`;
        break;
      case "goerli-nethermind.dnp.dappnode.eth":
        executionClientPraterUrl = `http://goerli-nethermind.dnp.dappnode:8545`;
        break;
      case "goerli-erigon.dnp.dappnode.eth":
        executionClientPraterUrl = `http://goerli-erigon.dappnode:8545`;
        break;
    }
    switch(ConsensusClientPrater) {
      case "prysm-prater.dnp.dappnode.eth":
        consensusClientPraterUrl = `http://beacon-chain.prysm-prater.dappnode:3500`;
        break;
      case "lighthouse-prater.dnp.dappnode.eth":
        consensusClientPraterUrl = `http://beacon-chain.lighthouse-prater.dappnode:3500`;
        break;
      case "teku-prater.dnp.dappnode.eth":
        consensusClientPraterUrl = `http://beacon-chain.teku-prater.dappnode:3500`;
        break;
      case "nimbus-prater.dnp.dappnode.eth":
        consensusClientPraterUrl = `http://beacon-validator.nimbus-prater.dappnode:4500`;
        break;
      case "lodestar-prater.dnp.dappnode.eth":
        consensusClientPraterUrl = `http://beacon-chain.lodestar-prater.dappnode:3500`;
        break;
    }
    switch(executionClientGnosis) {
      case "nethermind-xdai.dnp.dappnode.eth":
        executionClientGnosisUrl = `http://nethermind-xdai.dappnode:8545`;
        break;
    }
    switch(ConsensusClientGnosis) {
      case "lighthouse-gnosis.dnp.dappnode.eth":
        consensusClientGnosisUrl = `http://beacon-chain.gnosis-beacon-chain-prysm.dappnode:3500`;
        break;
      case "teku-gnosis.dnp.dappnode.eth":
        consensusClientGnosisUrl = `http://beacon-chain.teku-gnosis.dappnode:3500`;
        break;
      case "lodestar-gnosis.dnp.dappnode.eth":
        consensusClientGnosisUrl = `http://beacon-chain.lodestar.dappnode:3500`;
        break;
    }

  return {
    executionClientMainnetUrl,
    executionClientPraterUrl,
    executionClientGnosisUrl,
    consensusClientMainnetUrl,
    consensusClientPraterUrl,
    consensusClientGnosisUrl
  };
}
