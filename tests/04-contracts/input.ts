import { ethers, Contract } from "ethers";

const contract = new Contract(address, abi, signer);

// callStatic pattern
const result = await contract.callStatic.balanceOf(userAddress);
const name = await contract.callStatic.name();
const symbol = await contract.callStatic.symbol();

// estimateGas pattern
const gas = await contract.estimateGas.transfer(to, amount);

// populateTransaction pattern
const tx = await contract.populateTransaction.transfer(to, amount);

// functions pattern
const fnResult = await contract.functions.balanceOf(userAddress);

// deployTransaction
const deployTx = contract.deployTransaction;
