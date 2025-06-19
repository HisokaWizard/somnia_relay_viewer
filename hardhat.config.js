require('@nomiclabs/hardhat-ethers');

require('dotenv').config();

const key = process.env.DEPLOYER_KEY;
if (!key) {
  console.warn('⚠️ Variable DEPLOYER_KEY not exists in the .env');
}

module.exports = {
  solidity: '0.8.22',
  networks: {
    somnia: {
      url: 'https://rpc.ankr.com/somnia_testnet/',
      chainId: 50312,
      accounts: key ? [key] : [],
    },
  },
};
