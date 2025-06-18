export const ankrSomniaUrl = `https://rpc.ankr.com/somnia_testnet/${
  process.env.VITE_ANKR_API_KEY
}`;

export const somniaSubGraphApi =
  'https://api.subgraph.somnia.network/public_api/data_api/somnia/v1';

export const somniaSubgraphConfig = {
  headers: {
    Authorization: process.env.VITE_SUBGRAPH_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 20000,
};
