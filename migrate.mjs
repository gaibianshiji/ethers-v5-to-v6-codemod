// Migration runner - applies all transforms to a target project
// Usage: node migrate.mjs <target-dir>

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function applyAllTransforms(source) {
  let s = source;

  // === 01-IMPORTS ===
  const SUB_PACKAGES = [
    "@ethersproject/abi", "@ethersproject/abstract-provider", "@ethersproject/abstract-signer",
    "@ethersproject/address", "@ethersproject/base64", "@ethersproject/basex",
    "@ethersproject/bytes", "@ethersproject/constants", "@ethersproject/contracts",
    "@ethersproject/hash", "@ethersproject/hdnode", "@ethersproject/json-wallets",
    "@ethersproject/keccak256", "@ethersproject/networks", "@ethersproject/pbkdf2",
    "@ethersproject/properties", "@ethersproject/providers", "@ethersproject/random",
    "@ethersproject/rlp", "@ethersproject/sha2", "@ethersproject/signing-key",
    "@ethersproject/solidity", "@ethersproject/strings", "@ethersproject/transactions",
    "@ethersproject/units", "@ethersproject/wallet", "@ethersproject/web",
    "@ethersproject/wordlists",
  ];

  const REMOVED = ["@ethersproject/bignumber", "@ethersproject/logger"];

  for (const pkg of REMOVED) {
    const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`import\\s*\\{[^}]*\\}\\s*from\\s*["']${escaped}["']\\s*;?\\n?`, 'g');
    s = s.replace(re, (m) => `// REMOVED in v6: ${m.trim()}\n`);
  }

  for (const pkg of SUB_PACKAGES) {
    const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`"${escaped}"`, 'g'), '"ethers"');
    s = s.replace(new RegExp(`'${escaped}'`, 'g'), "'ethers'");
  }

  // Import name renames
  const importRenames = {
    'arrayify': 'getBytes', 'Web3Provider': 'BrowserProvider', 'BaseProvider': 'AbstractProvider',
    'IpcProvider': 'IpcSocketProvider', 'HDNode': 'HDNodeWallet', 'solidityPack': 'solidityPacked',
    'defineReadOnly': 'defineProperties', 'AddressZero': 'ZeroAddress', 'HashZero': 'ZeroHash',
    'splitSignature': 'Signature', 'joinSignature': 'Signature',
    'Signer': 'AbstractSigner', 'getNetwork': 'Network', 'fetchJson': 'FetchRequest',
    'parseTransaction': 'Transaction', 'serializeTransaction': 'Transaction',
  };

  for (const [old, rep] of Object.entries(importRenames)) {
    const re = new RegExp(`(import\\s*\\{[^}]*?)\\b${old}\\b([^}]*\\})`, 'g');
    s = s.replace(re, `$1${rep}$2`);
  }

  // Deduplicate renamed imports
  s = s.replace(/import\s*\{([^}]*)\}\s*from/g, (m, names) => {
    const parts = names.split(',').map(n => n.trim()).filter(Boolean);
    const unique = [...new Set(parts)];
    return `import { ${unique.join(', ')} } from`;
  });

  // === 02-NAMESPACES ===
  const providerRenames = {
    'Web3Provider': 'BrowserProvider', 'JsonRpcProvider': 'JsonRpcProvider',
    'InfuraProvider': 'InfuraProvider', 'AlchemyProvider': 'AlchemyProvider',
    'EtherscanProvider': 'EtherscanProvider', 'CloudflareProvider': 'CloudflareProvider',
    'PocketProvider': 'PocketProvider', 'AnkrProvider': 'AnkrProvider',
    'FallbackProvider': 'FallbackProvider', 'WebSocketProvider': 'WebSocketProvider',
    'IpcProvider': 'IpcSocketProvider', 'BaseProvider': 'AbstractProvider',
    'getDefaultProvider': 'getDefaultProvider',
  };
  for (const [old, rep] of Object.entries(providerRenames)) {
    s = s.replace(new RegExp(`ethers\\.providers\\.${old}\\b`, 'g'), `ethers.${rep}`);
  }

  const utilsRenames = {
    'parseEther': 'parseEther', 'formatEther': 'formatEther', 'parseUnits': 'parseUnits',
    'formatUnits': 'formatUnits', 'keccak256': 'keccak256', 'sha256': 'sha256',
    'ripemd160': 'ripemd160', 'id': 'id', 'namehash': 'namehash',
    'getAddress': 'getAddress', 'getIcapAddress': 'getIcapAddress', 'isAddress': 'isAddress',
    'toUtf8Bytes': 'toUtf8Bytes', 'toUtf8String': 'toUtf8String',
    'randomBytes': 'randomBytes', 'computeHmac': 'computeHmac', 'pbkdf2': 'pbkdf2',
    'scrypt': 'scrypt', 'scryptSync': 'scryptSync',
    'dnsEncode': 'dnsEncode', 'isValidName': 'isValidName', 'ensNormalize': 'ensNormalize',
    'hashMessage': 'hashMessage', 'verifyMessage': 'verifyMessage',
    'verifyTypedData': 'verifyTypedData', 'resolveProperties': 'resolveProperties',
    'defineProperties': 'defineProperties',
    'solidityPack': 'solidityPacked', 'solidityKeccak256': 'solidityPackedKeccak256',
    'soliditySha256': 'solidityPackedSha256',
    'formatBytes32String': 'encodeBytes32String', 'parseBytes32String': 'decodeBytes32String',
    'hexDataSlice': 'dataSlice', 'hexDataLength': 'dataLength',
    'hexZeroPad': 'zeroPadValue', 'hexStripZeros': 'stripZerosLeft',
    'hexValue': 'toQuantity', 'hexConcat': 'concat', 'hexDataConcat': 'concat',
    'arrayify': 'getBytes', 'SigningKey': 'SigningKey',
    '_TypedDataEncoder': 'TypedDataEncoder', 'TypedDataEncoder': 'TypedDataEncoder',
    'AbiCoder': 'AbiCoder',
  };
  for (const [old, rep] of Object.entries(utilsRenames)) {
    s = s.replace(new RegExp(`ethers\\.utils\\.${old}\\b`, 'g'), `ethers.${rep}`);
  }

  s = s.replace(/ethers\.utils\.RLP\.encode\b/g, 'ethers.encodeRlp');
  s = s.replace(/ethers\.utils\.RLP\.decode\b/g, 'ethers.decodeRlp');
  s = s.replace(/ethers\.utils\.base64\.encode\b/g, 'ethers.encodeBase64');
  s = s.replace(/ethers\.utils\.base64\.decode\b/g, 'ethers.decodeBase64');
  s = s.replace(/ethers\.utils\.base58\.encode\b/g, 'ethers.encodeBase58');
  s = s.replace(/ethers\.utils\.base58\.decode\b/g, 'ethers.decodeBase58');

  // ethers.constants
  const constRenames = {
    'AddressZero': 'ZeroAddress', 'HashZero': 'ZeroHash', 'EtherSymbol': 'EtherSymbol',
    'MessagePrefix': 'MessagePrefix', 'MaxUint256': 'MaxUint256', 'WeiPerEther': 'WeiPerEther',
    'MinInt256': 'MinInt256', 'MaxInt256': 'MaxInt256', 'N': 'N',
  };
  for (const [old, rep] of Object.entries(constRenames)) {
    s = s.replace(new RegExp(`ethers\\.constants\\.${old}\\b`, 'g'), `ethers.${rep}`);
  }
  s = s.replace(/ethers\.constants\.NegativeOne\b/g, '(-1n)');
  s = s.replace(/ethers\.constants\.Zero\b/g, '(0n)');
  s = s.replace(/ethers\.constants\.One\b/g, '(1n)');
  s = s.replace(/ethers\.constants\.Two\b/g, '(2n)');

  // Also handle destructured constants usage
  for (const [old, rep] of Object.entries(constRenames)) {
    s = s.replace(new RegExp(`constants\\.${old}\\b`, 'g'), `ethers.${rep}`);
  }
  s = s.replace(/constants\.NegativeOne\b/g, '(-1n)');
  s = s.replace(/constants\.Zero\b/g, '(0n)');
  s = s.replace(/constants\.One\b/g, '(1n)');
  s = s.replace(/constants\.Two\b/g, '(2n)');

  // === 03-BIGNUMBER ===
  s = s.replace(/BigNumber\.from\(/g, 'BigInt(');
  s = s.replace(/BigInt\(([^)]+)\)\.toHexString\(\)/g, 'toBeHex($1)');

  // Remove BigNumber from imports (use \b to avoid matching BigNumberish)
  s = s.replace(/import\s*\{[^}]*BigNumber[^}]*\}\s*from\s*["']ethers["']\s*;?\n?/g, (m) => {
    const cleaned = m.replace(/\bBigNumber\b\s*,?\s*/g, '').replace(/,\s*}/g, ' }').replace(/\{\s*,/g, '{');
    if (cleaned.match(/import\s*\{\s*\}\s*from/)) return '';
    return cleaned;
  });

  // BigNumber methods -> operators
  // NOTE: Only apply to safe patterns. .eq/.lt/.gt/.pow etc. conflict with chai assertions.
  // We use context-aware patterns to minimize false positives.
  // First pass: BigNumber.from().op() patterns (before BigNumber.from -> BigInt)
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.pow\(([^)]+)\)\.sub\(([^)]+)\)/g, 'BigInt($1) ** $2 - $3');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.pow\(([^)]+)\)\.add\(([^)]+)\)/g, 'BigInt($1) ** $2 + $3');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.mul\(([^)]+)\)\.sub\(([^)]+)\)/g, 'BigInt($1) * $2 - $3');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.mul\(([^)]+)\)\.add\(([^)]+)\)/g, 'BigInt($1) * $2 + $3');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.add\(([^)]+)\)/g, 'BigInt($1) + $2');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.sub\(([^)]+)\)/g, 'BigInt($1) - $2');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.mul\(([^)]+)\)/g, 'BigInt($1) * $2');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.div\(([^)]+)\)/g, 'BigInt($1) / $2');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.mod\(([^)]+)\)/g, 'BigInt($1) % $2');
  s = s.replace(/BigNumber\.from\(([^)]+)\)\.pow\(([^)]+)\)/g, 'BigInt($1) ** $2');
  // Second pass: BigInt().op() patterns (after BigNumber.from -> BigInt)
  s = s.replace(/BigInt\(([^)]+)\)\.pow\(([^)]+)\)\.sub\(([^)]+)\)/g, 'BigInt($1) ** $2 - $3');
  s = s.replace(/BigInt\(([^)]+)\)\.pow\(([^)]+)\)\.add\(([^)]+)\)/g, 'BigInt($1) ** $2 + $3');
  s = s.replace(/BigInt\(([^)]+)\)\.mul\(([^)]+)\)\.sub\(([^)]+)\)/g, 'BigInt($1) * $2 - $3');
  s = s.replace(/BigInt\(([^)]+)\)\.mul\(([^)]+)\)\.add\(([^)]+)\)/g, 'BigInt($1) * $2 + $3');
  s = s.replace(/BigInt\(([^)]+)\)\.add\(([^)]+)\)/g, 'BigInt($1) + $2');
  s = s.replace(/BigInt\(([^)]+)\)\.sub\(([^)]+)\)/g, 'BigInt($1) - $2');
  s = s.replace(/BigInt\(([^)]+)\)\.mul\(([^)]+)\)/g, 'BigInt($1) * $2');
  s = s.replace(/BigInt\(([^)]+)\)\.div\(([^)]+)\)/g, 'BigInt($1) / $2');
  s = s.replace(/BigInt\(([^)]+)\)\.mod\(([^)]+)\)/g, 'BigInt($1) % $2');
  s = s.replace(/BigInt\(([^)]+)\)\.pow\(([^)]+)\)/g, 'BigInt($1) ** $2');
  // Safe BigNumber-only methods (no chai equivalent)
  s = s.replace(/\.isZero\(\)/g, ' === 0n');
  s = s.replace(/\.isNegative\(\)/g, ' < 0n');
  s = s.replace(/\.isPositive\(\)/g, ' > 0n');
  s = s.replace(/(\w+)\.toNumber\(\)/g, 'Number($1)');
  s = s.replace(/(\w+)\.toHexString\(\)/g, '"0x" + $1.toString(16)');
  s = s.replace(/\.toBigInt\(\)/g, '');

  // === 04-CONTRACTS ===
  s = s.replace(/\.callStatic\.(\w+)\(/g, '.$1.staticCall(');
  s = s.replace(/\.estimateGas\.(\w+)\(/g, '.$1.estimateGas(');
  s = s.replace(/\.populateTransaction\.(\w+)\(/g, '.$1.populateTransaction(');
  s = s.replace(/\.functions\.(\w+)\(/g, '.$1.staticCallResult(');
  s = s.replace(/\.deployTransaction\b/g, '.deploymentTransaction()');

  // === 05-PROVIDERS ===
  s = s.replace(/provider\.sendTransaction\(/g, 'provider.broadcastTransaction(');
  s = s.replace(/\bethers\.Signer\b(?!Name|s)/g, 'ethers.AbstractSigner');
  s = s.replace(/await\s+provider\.getGasPrice\(\)/g, '(await provider.getFeeData()).gasPrice');
  s = s.replace(/provider\.getGasPrice\(\)/g, '(await provider.getFeeData()).gasPrice');

  // === 06-UTILITIES ===
  const fnRenames = {
    'arrayify': 'getBytes', 'solidityPack': 'solidityPacked',
    'solidityKeccak256': 'solidityPackedKeccak256', 'soliditySha256': 'solidityPackedSha256',
    'formatBytes32String': 'encodeBytes32String', 'parseBytes32String': 'decodeBytes32String',
    'hexDataSlice': 'dataSlice', 'hexDataLength': 'dataLength',
    'hexZeroPad': 'zeroPadValue', 'hexStripZeros': 'stripZerosLeft',
    'hexValue': 'toQuantity', 'hexConcat': 'concat', 'hexDataConcat': 'concat',
    'defineReadOnly': 'defineProperties', 'formatAddress': 'getAddress',
  };
  for (const [old, rep] of Object.entries(fnRenames)) {
    s = s.replace(new RegExp(`\\b${old}\\(`, 'g'), `${rep}(`);
  }

  s = s.replace(/AbiCoder\.defaultAbiCoder\b(?!\(\))/g, 'AbiCoder.defaultAbiCoder()');
  s = s.replace(/ethers\.utils\.defaultAbiCoder\b(?!\(\))/g, 'ethers.AbiCoder.defaultAbiCoder()');
  s = s.replace(/\.getSighash\(([^)]+)\)/g, '.getFunction($1).selector');
  s = s.replace(/Wallet\.fromMnemonic\(/g, 'HDNodeWallet.fromMnemonic(');
  s = s.replace(/Wallet\.createRandom\(/g, 'HDNodeWallet.createRandom(');
  s = s.replace(/Wallet\.fromSeed\(/g, 'HDNodeWallet.fromSeed(');
  s = s.replace(/\bHDNode\b(?!Wallet)/g, 'HDNodeWallet');

  // === 08-SIGNATURES ===
  s = s.replace(/\bsplitSignature\(/g, 'Signature.from(');
  s = s.replace(/\bjoinSignature\(([^)]+)\)/g, 'Signature.from($1).serialized');
  s = s.replace(/\bparseTransaction\(/g, 'Transaction.from(');
  s = s.replace(/\bserializeTransaction\((\w+),\s*(\w+)\)/g, 'Transaction.from({ ...$1, signature: $2 }).serialized');
  s = s.replace(/\bserializeTransaction\((\w+)\)/g, 'Transaction.from($1).serialized');

  return s;
}

// Collect all TS files
function getTsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      results.push(...getTsFiles(full));
    } else if (extname(entry) === '.ts' || extname(entry) === '.tsx') {
      results.push(full);
    }
  }
  return results;
}

const targetDir = process.argv[2] || 'test-repo';
const files = getTsFiles(targetDir);

let totalChanges = 0;
let filesChanged = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const migrated = applyAllTransforms(original);

  if (migrated !== original) {
    writeFileSync(file, migrated, 'utf8');
    const changes = original.split('\n').filter((line, i) => line !== migrated.split('\n')[i]).length;
    totalChanges += changes;
    filesChanged++;
    console.log(`✏️  ${file} (${changes} lines changed)`);
  }
}

console.log(`\n✅ Migration complete: ${filesChanged} files changed, ~${totalChanges} lines modified`);
