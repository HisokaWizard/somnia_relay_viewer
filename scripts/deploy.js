import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const sttAddress = '0xF22eF0085f6511f70b01a68F360dCc56261F768a';

  console.log(
    `Deploying GameLifecycle contract with STT token at: ${sttAddress}`
  );

  const GameLifecycle = await ethers.getContractFactory('GameLifecycle');
  const gameLifecycle = await GameLifecycle.deploy(sttAddress);
  await gameLifecycle.deployed();
  console.log('GameLifecycle deployed to:', gameLifecycle.address);
}

main().catch(console.error);
