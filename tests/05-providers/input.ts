import { ethers, Signer } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(url);
const web3 = new ethers.providers.Web3Provider(window.ethereum);
const signer: ethers.Signer = provider.getSigner();

// sendTransaction on provider
const tx = await provider.sendTransaction(signedTx);

// getGasPrice
const gasPrice = await provider.getGasPrice();

const network = await provider.getNetwork();
