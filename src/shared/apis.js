import axios from 'axios';

export const ankrSomniaUrl = `https://rpc.ankr.com/somnia_testnet/${
  import.meta.env.VITE_ANKR_API_KEY
}`;

const ETH_INFURA_URL = 'https://mainnet.infura.io/v3';
const url = `${ETH_INFURA_URL}/${import.meta.env.VITE_INFURA_API_KEY}`;

const somniaGeneral = 'https://somnia-poc.w3us.site/api/v2';

export const getBlockDataByNumber = async (blockNumber) => {
  try {
    const blockByNumberResponse = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [`0x${blockNumber.toString(16)}`, true],
      id: 1,
    });

    return blockByNumberResponse;
  } catch (error) {
    console.error(error);
  }
};

export const getTransactionByHash = async (txh) => {
  try {
    const txhResponse = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [txh],
      id: 1,
    });

    return txhResponse;
  } catch (error) {
    console.error(error);
  }
};

export const getSignature = async (methodHash) => {
  const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${methodHash}`;
  const response = await axios.get(url);
  return response;
};

export const getBlockDataByNumberSomnia = async (blockNumber) => {
  try {
    const blockByNumberResponse = await axios.get(`${somniaGeneral}/blocks/${blockNumber}`);

    return blockByNumberResponse;
  } catch (error) {
    console.error(error);
  }
};

export const getSomniaStats = async () => {
  try {
    const blockByNumberResponse = await axios.get(`${somniaGeneral}/stats`);

    return blockByNumberResponse;
  } catch (error) {
    console.error(error);
  }
};

export const getBlockWithTxhs = async (blockNumber) => {
  try {
    const blockByNumberResponse = await axios.get(`${somniaGeneral}/${blockNumber}/transactions`);

    return blockByNumberResponse;
  } catch (error) {
    console.error(error);
  }
};

export const getTransactionsPerDays = async () => {
  try {
    const response = await axios.get(`${somniaGeneral}/stats/charts/transactions`);

    return response;
  } catch (error) {
    console.error(error);
  }
};
