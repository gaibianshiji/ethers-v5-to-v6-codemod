import { ethers } from "ethers";

// Function renames
const bytes = arrayify("0x1234");
const padded = hexZeroPad("0x1234", 32);
const sliced = hexDataSlice("0x123456", 0, 2);
const length = hexDataLength("0x1234");
const stripped = hexStripZeros("0x001234");
const value = hexValue("0x1234");
const concat = hexConcat(["0x12", "0x34"]);
const dataConcat = hexDataConcat(["0x12", "0x34"]);

// Solidity helpers
const packed = solidityPack(["address", "uint256"], [addr, amount]);
const packedHash = solidityKeccak256(["address", "uint256"], [addr, amount]);
const packedSha = soliditySha256(["address", "uint256"], [addr, amount]);

// Encoding
const encoded = formatBytes32String("hello");
const decoded = parseBytes32String(encoded);

// ABI
const coder = AbiCoder.defaultAbiCoder;
const encoded2 = coder.encode(["uint256"], [100]);

// Wallet
const hdNode = HDNode.fromMnemonic("test test test");
const wallet2 = Wallet.fromMnemonic("test test test");
const random = Wallet.createRandom();

// Interface
const iface = new ethers.Interface(abi);
const sighash = iface.getSighash("transfer");
