import { ethers, Signature, Transaction } from "ethers";

const sig = Signature.from("0x1234");
const joined = Signature.from(sig).serialized;
const tx = Transaction.from("0x1234");
const serialized = Transaction.from(tx).serialized;
const serializedWithSig = Transaction.from({ ...tx, signature: sig }).serialized;
