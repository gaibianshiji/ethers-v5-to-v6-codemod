import { ethers, BigNumber } from "ethers";

const value = BigNumber.from("1000000000000000000");
const doubled = BigNumber.from("1000000000000000000").mul(2);
const sum = BigNumber.from("1000000000000000000").add(BigNumber.from("500"));
const quotient = BigNumber.from("1000000000000000000").div(100);
const remainder = BigNumber.from("100").mod(3);
const power = BigNumber.from(2).pow(128);
const chained = BigNumber.from(2).pow(128).sub(1);
const isZero = value.isZero();
const isNeg = value.isNegative();
const asNumber = value.toNumber();
const asHex = value.toHexString();

const balance = await provider.getBalance(address);
const gasEstimate = await provider.estimateGas(tx);
