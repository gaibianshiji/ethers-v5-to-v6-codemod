import { ethers, Contract } from "ethers";

const contract = new Contract(address, abi, signer);

// callStatic pattern
const result = await contract.balanceOf.staticCall(userAddress);
const name = await contract.name.staticCall();
const symbol = await contract.symbol.staticCall();

// estimateGas pattern
const gas = await contract.transfer.estimateGas(to, amount);

// populateTransaction pattern
const tx = await contract.transfer.populateTransaction(to, amount);

// functions pattern
const fnResult = await contract.balanceOf.staticCallResult(userAddress);

// deployTransaction
const deployTx = contract.deploymentTransaction();
