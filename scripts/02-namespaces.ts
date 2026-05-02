import type { SgRoot, SgNode } from "codemod:ast-grep";

// ethers.providers.X -> ethers.X
const PROVIDER_RENAMES: Record<string, string> = {
  "Web3Provider": "BrowserProvider",
  "JsonRpcProvider": "JsonRpcProvider",
  "JsonRpcBatchProvider": "JsonRpcProvider",
  "InfuraProvider": "InfuraProvider",
  "AlchemyProvider": "AlchemyProvider",
  "EtherscanProvider": "EtherscanProvider",
  "CloudflareProvider": "CloudflareProvider",
  "PocketProvider": "PocketProvider",
  "AnkrProvider": "AnkrProvider",
  "FallbackProvider": "FallbackProvider",
  "WebSocketProvider": "WebSocketProvider",
  "IpcProvider": "IpcSocketProvider",
  "BaseProvider": "AbstractProvider",
  "StaticJsonRpcProvider": "JsonRpcProvider",
  "getDefaultProvider": "getDefaultProvider",
  "getNetwork": "Network.from",
};

// ethers.utils.X -> ethers.X (with possible renames)
const UTILS_RENAMES: Record<string, string> = {
  "parseEther": "parseEther",
  "formatEther": "formatEther",
  "parseUnits": "parseUnits",
  "formatUnits": "formatUnits",
  "keccak256": "keccak256",
  "sha256": "sha256",
  "ripemd160": "ripemd160",
  "id": "id",
  "namehash": "namehash",
  "getAddress": "getAddress",
  "getIcapAddress": "getIcapAddress",
  "isAddress": "isAddress",
  "toUtf8Bytes": "toUtf8Bytes",
  "toUtf8String": "toUtf8String",
  "randomBytes": "randomBytes",
  "computeHmac": "computeHmac",
  "pbkdf2": "pbkdf2",
  "scrypt": "scrypt",
  "scryptSync": "scryptSync",
  "dnsEncode": "dnsEncode",
  "isValidName": "isValidName",
  "ensNormalize": "ensNormalize",
  "hashMessage": "hashMessage",
  "verifyMessage": "verifyMessage",
  "verifyTypedData": "verifyTypedData",
  "resolveProperties": "resolveProperties",
  "defineProperties": "defineProperties",
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
  "arrayify": "getBytes",
  "SigningKey": "SigningKey",
  "_TypedDataEncoder": "TypedDataEncoder",
  "TypedDataEncoder": "TypedDataEncoder",
  "AbiCoder": "AbiCoder",
  "Logger": "Logger",
};

// ethers.constants.X -> ethers.X or literal
const CONSTANTS_RENAMES: Record<string, string> = {
  "AddressZero": "ZeroAddress",
  "HashZero": "ZeroHash",
  "EtherSymbol": "EtherSymbol",
  "MessagePrefix": "MessagePrefix",
  "MaxUint256": "MaxUint256",
  "WeiPerEther": "WeiPerEther",
  "MinInt256": "MinInt256",
  "MaxInt256": "MaxInt256",
  "NegativeOne": "(-1n)",
  "Zero": "(0n)",
  "One": "(1n)",
  "Two": "(2n)",
  "N": "N",
};

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // Flatten ethers.providers.X -> ethers.X
  for (const [old, newName] of Object.entries(PROVIDER_RENAMES)) {
    const pattern = new RegExp(`ethers\\.providers\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, `ethers.${newName}`);
      changed = true;
    }
  }

  // Flatten ethers.utils.X -> ethers.X
  for (const [old, newName] of Object.entries(UTILS_RENAMES)) {
    const pattern = new RegExp(`ethers\\.utils\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, `ethers.${newName}`);
      changed = true;
    }
  }

  // Flatten ethers.utils.RLP.encode -> ethers.encodeRlp
  source = source.replace(/ethers\.utils\.RLP\.encode\b/g, "ethers.encodeRlp");
  source = source.replace(/ethers\.utils\.RLP\.decode\b/g, "ethers.decodeRlp");

  // Flatten ethers.utils.base64.encode -> ethers.encodeBase64
  source = source.replace(/ethers\.utils\.base64\.encode\b/g, "ethers.encodeBase64");
  source = source.replace(/ethers\.utils\.base64\.decode\b/g, "ethers.decodeBase64");

  // Flatten ethers.utils.base58.encode -> ethers.encodeBase58
  source = source.replace(/ethers\.utils\.base58\.encode\b/g, "ethers.encodeBase58");
  source = source.replace(/ethers\.utils\.base58\.decode\b/g, "ethers.decodeBase58");

  // Flatten ethers.constants.X -> ethers.X or literal
  for (const [old, newName] of Object.entries(CONSTANTS_RENAMES)) {
    const pattern = new RegExp(`ethers\\.constants\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, newName.startsWith("(") ? newName : `ethers.${newName}`);
      changed = true;
    }
  }

  // Handle destructured: const { providers } = ethers; ... providers.X -> ethers.X
  // This is complex - handle common patterns
  source = source.replace(
    /const\s*\{\s*providers\s*\}\s*=\s*ethers\s*;?\s*\n?/g,
    "// ethers.providers namespace removed in v6 - use top-level imports\n"
  );

  source = source.replace(
    /const\s*\{\s*utils\s*\}\s*=\s*ethers\s*;?\s*\n?/g,
    "// ethers.utils namespace removed in v6 - use top-level imports\n"
  );

  source = source.replace(
    /const\s*\{\s*constants\s*\}\s*=\s*ethers\s*;?\s*\n?/g,
    "// ethers.constants namespace removed in v6 - use top-level imports\n"
  );

  if (!changed && source === rootNode.text()) return null;
  return source;
}
