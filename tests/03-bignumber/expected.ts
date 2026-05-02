import { ethers } from "ethers";

const value = BigInt("1000000000000000000");
const doubled = BigInt("1000000000000000000") * 2;
const sum = BigInt("1000000000000000000") + BigInt("500");
const quotient = BigInt("1000000000000000000") / 100;
const remainder = BigInt("100") % 3;
const power = BigInt(2) ** 128;
const chained = BigInt(2) ** 128 - 1;
const isZero = value === 0n;
const isNeg = value < 0n;
const asNumber = Number(value);
const asHex = "0x" + value.toString(16);

const balance = await provider.getBalance(address);
const gasEstimate = await provider.estimateGas(tx);
