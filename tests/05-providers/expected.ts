import { ethers, AbstractSigner } from "ethers";

const provider = new ethers.JsonRpcProvider(url);
const web3 = new ethers.BrowserProvider(window.ethereum);
const signer: ethers.AbstractSigner = provider.getSigner();

// sendTransaction on provider
const tx = await provider.broadcastTransaction(signedTx);

// getGasPrice
const gasPrice = (await provider.getFeeData()).gasPrice;

const network = await provider.getNetwork();
