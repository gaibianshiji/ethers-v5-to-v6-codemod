import { ethers } from "ethers";

// Function renames
const bytes = getBytes("0x1234");
const padded = zeroPadValue("0x1234", 32);
const sliced = dataSlice("0x123456", 0, 2);
const length = dataLength("0x1234");
const stripped = stripZerosLeft("0x001234");
const value = toQuantity("0x1234");
const concat = concat(["0x12", "0x34"]);
const dataConcat = concat(["0x12", "0x34"]);

// Solidity helpers
const packed = solidityPacked(["address", "uint256"], [addr, amount]);
const packedHash = solidityPackedKeccak256(["address", "uint256"], [addr, amount]);
const packedSha = solidityPackedSha256(["address", "uint256"], [addr, amount]);

// Encoding
const encoded = encodeBytes32String("hello");
const decoded = decodeBytes32String(encoded);

// ABI
const coder = AbiCoder.defaultAbiCoder();
const encoded2 = coder.encode(["uint256"], [100]);

// Wallet
const hdNode = HDNodeWallet.fromMnemonic("test test test");
const wallet2 = HDNodeWallet.fromMnemonic("test test test");
const random = HDNodeWallet.createRandom();

// Interface
const iface = new ethers.Interface(abi);
const sighash = iface.getFunction("transfer").selector;
