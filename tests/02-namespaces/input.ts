import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
const infura = new ethers.providers.InfuraProvider("mainnet", "key");
const alchemy = new ethers.providers.AlchemyProvider("mainnet", "key");
const wsProvider = new ethers.providers.WebSocketProvider("ws://localhost:8546");

const address = ethers.utils.getAddress("0x1234");
const isAddr = ethers.utils.isAddress("0x1234");
const parsed = ethers.utils.parseEther("1.0");
const formatted = ethers.utils.formatEther(BigInt("1000000000000000000"));
const hash = ethers.utils.keccak256("0x1234");
const bytes = ethers.utils.arrayify("0x1234");
const padded = ethers.utils.hexZeroPad("0x1234", 32);
const sliced = ethers.utils.hexDataSlice("0x123456", 0, 2);
const packed = ethers.utils.solidityPack(["address"], ["0x1234"]);

const zero = ethers.constants.AddressZero;
const hashZero = ethers.constants.HashZero;
const maxUint = ethers.constants.MaxUint256;
const negOne = ethers.constants.NegativeOne;
const weiPerEth = ethers.constants.WeiPerEther;
