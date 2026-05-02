import { ethers, Contract, AbstractSigner } from "ethers";
import { InfuraProvider } from "ethers";
import { parseEther, formatEther } from "ethers";
import { Wallet } from "ethers";
import { getBytes } from "ethers";

// Provider setup
const provider = new ethers.InfuraProvider("mainnet", process.env.INFURA_KEY);
const web3Provider = new ethers.BrowserProvider(window.ethereum);
const signer: ethers.AbstractSigner = web3Provider.getSigner();

// Contract interaction
const contract = new Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

async function getBalance(address: string): Promise<string> {
  const balance = await contract.balanceOf.staticCall(address);
  return ethers.formatEther(balance);
}

async function transfer(to: string, amount: string): Promise<void> {
  const parsed = ethers.parseEther(amount);
  const gas = await contract.transfer.estimateGas(to, parsed);
  const tx = await contract.transfer.populateTransaction(to, parsed);
  await signer.sendTransaction(tx);
}

// Constants
const zero = ethers.ZeroAddress;
const maxUint = ethers.MaxUint256;

// BigNumber operations
const value = BigInt("1000000000000000000");
const doubled = value.mul(2);
const isZero = value === 0n;

// Wallet
const wallet = HDNodeWallet.fromMnemonic("test mnemonic phrase");
const randomWallet = HDNodeWallet.createRandom();

// Utilities
const hash = ethers.keccak256("0x1234");
const address = ethers.getAddress("0x1234567890abcdef");
const bytes = getBytes("0x1234");
