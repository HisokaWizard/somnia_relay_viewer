import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const QuizSession = await ethers.getContractFactory('QuizSession');
  const quizSession = await QuizSession.deploy();
  await quizSession.deployed();
  console.log('QuizSession deployed to:', quizSession.address);
}

main().catch(console.error);
