import { ethers, splitSignature, joinSignature, parseTransaction, serializeTransaction } from "ethers";

const sig = splitSignature("0x1234");
const joined = joinSignature(sig);
const tx = parseTransaction("0x1234");
const serialized = serializeTransaction(tx);
const serializedWithSig = serializeTransaction(tx, sig);
