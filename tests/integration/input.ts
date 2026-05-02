import { ethers, BigNumber, Contract, Signer } from "ethers";
import { InfuraProvider } from "@ethersproject/providers";
import { parseEther, formatEther } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import { arrayify } from "@ethersproject/bytes";

// Provider setup
const provider = new ethers.providers.InfuraProvider("mainnet", process.env.INFURA_KEY);
const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
const signer: ethers.Signer = web3Provider.getSigner();

// Contract interaction
const contract = new Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

async function getBalance(address: string): Promise<string> {
  const balance = await contract.callStatic.balanceOf(address);
  return ethers.utils.formatEther(balance);
}

async function transfer(to: string, amount: string): Promise<void> {
  const parsed = ethers.utils.parseEther(amount);
  const gas = await contract.estimateGas.transfer(to, parsed);
  const tx = await contract.populateTransaction.transfer(to, parsed);
  await signer.sendTransaction(tx);
}

// Constants
const zero = ethers.constants.AddressZero;
const maxUint = ethers.constants.MaxUint256;

// BigNumber operations
const value = BigNumber.from("1000000000000000000");
const doubled = value.mul(2);
const isZero = value.isZero();

// Wallet
const wallet = Wallet.fromMnemonic("test mnemonic phrase");
const randomWallet = Wallet.createRandom();

// Utilities
const hash = ethers.utils.keccak256("0x1234");
const address = ethers.utils.getAddress("0x1234567890abcdef");
const bytes = arrayify("0x1234");
