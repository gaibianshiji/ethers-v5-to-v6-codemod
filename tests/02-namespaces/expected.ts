import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const web3Provider = new ethers.BrowserProvider(window.ethereum);
const infura = new ethers.InfuraProvider("mainnet", "key");
const alchemy = new ethers.AlchemyProvider("mainnet", "key");
const wsProvider = new ethers.WebSocketProvider("ws://localhost:8546");

const address = ethers.getAddress("0x1234");
const isAddr = ethers.isAddress("0x1234");
const parsed = ethers.parseEther("1.0");
const formatted = ethers.formatEther(BigInt("1000000000000000000"));
const hash = ethers.keccak256("0x1234");
const bytes = ethers.getBytes("0x1234");
const padded = ethers.zeroPadValue("0x1234", 32);
const sliced = ethers.dataSlice("0x123456", 0, 2);
const packed = ethers.solidityPacked(["address"], ["0x1234"]);

const zero = ethers.ZeroAddress;
const hashZero = ethers.ZeroHash;
const maxUint = ethers.MaxUint256;
const negOne = (-1n);
const weiPerEth = ethers.WeiPerEther;
