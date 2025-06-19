import { ethers } from 'ethers';
import QuizSessionABI from './QuizSession.json';

export const deployQuizSession = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const factory = new ethers.ContractFactory(
    QuizSessionABI.abi,
    QuizSessionABI.bytecode,
    signer
  );
  const contract = await factory.deploy();
  await contract.deployed();
  console.log('Deployed at', contract.address);
  return contract;
};

export const startSession = async (
  contract,
  question,
  options,
  correctIdx,
  feeEther
) => {
  await contract.startSession(
    question,
    options,
    correctIdx,
    ethers.utils.parseEther(feeEther)
  );
};

export const submitAnswer = async (contract, answerIdx, feeEther) => {
  await contract.submitAnswer(answerIdx, {
    value: ethers.utils.parseEther(feeEther),
  });
};

export const endSession = async (contract) => {
  await contract.endSession();
};

export const withdrawReserve = async (contract, toAddress) => {
  await contract.withdrawReserve(toAddress);
};
