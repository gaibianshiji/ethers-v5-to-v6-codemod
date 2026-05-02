import type { SgRoot, SgNode } from "codemod:ast-grep";

// Direct function renames (1:1 mapping)
const FN_RENAMES: Record<string, string> = {
  "arrayify": "getBytes",
  "solidityPack": "solidityPacked",
  "solidityKeccak256": "solidityPackedKeccak256",
  "soliditySha256": "solidityPackedSha256",
  "formatBytes32String": "encodeBytes32String",
  "parseBytes32String": "decodeBytes32String",
  "hexDataSlice": "dataSlice",
  "hexDataLength": "dataLength",
  "hexZeroPad": "zeroPadValue",
  "hexStripZeros": "stripZerosLeft",
  "hexValue": "toQuantity",
  "hexConcat": "concat",
  "hexDataConcat": "concat",
  "defineReadOnly": "defineProperties",
  "formatAddress": "getAddress",
};

// getCreateAddress and getCreate2Address have signature changes
// v5: getCreateAddress(from, nonce) -> v6: getCreateAddress({ from, nonce })
// v5: getCreate2Address(from, salt, initCodeHash) -> v6: getCreate2Address({ from, salt, initCodeHash })

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // Apply direct function renames
  for (const [old, newName] of Object.entries(FN_RENAMES)) {
    const pattern = new RegExp(`\\b${old}\\(`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, `${newName}(`);
      changed = true;
    }
  }

  // AbiCoder.defaultAbiCoder (property) -> AbiCoder.defaultAbiCoder() (function call)
  if (source.includes("AbiCoder.defaultAbiCoder") && !source.includes("AbiCoder.defaultAbiCoder()")) {
    source = source.replace(/AbiCoder\.defaultAbiCoder\b(?!\(\))/g, "AbiCoder.defaultAbiCoder()");
    changed = true;
  }

  // ethers.utils.defaultAbiCoder -> ethers.AbiCoder.defaultAbiCoder()
  if (source.includes("ethers.utils.defaultAbiCoder")) {
    source = source.replace(/ethers\.utils\.defaultAbiCoder\b(?!\(\))/g, "ethers.AbiCoder.defaultAbiCoder()");
    changed = true;
  }

  // Interface.getSighash(fragment) -> Interface.getFunction(fragment).selector
  source = source.replace(
    /\.getSighash\(([^)]+)\)/g,
    ".getFunction($1).selector"
  );

  // Wallet.fromMnemonic -> HDNodeWallet.fromMnemonic
  source = source.replace(/Wallet\.fromMnemonic\(/g, "HDNodeWallet.fromMnemonic(");
  // Wallet.createRandom -> HDNodeWallet.createRandom
  source = source.replace(/Wallet\.createRandom\(/g, "HDNodeWallet.createRandom(");
  // Wallet.fromSeed -> HDNodeWallet.fromSeed
  source = source.replace(/Wallet\.fromSeed\(/g, "HDNodeWallet.fromSeed(");

  // HDNode -> HDNodeWallet (class references)
  source = source.replace(/\bHDNode\b(?!Wallet)/g, "HDNodeWallet");

  if (changed || source !== rootNode.text()) {
    return source;
  }
  return null;
}
