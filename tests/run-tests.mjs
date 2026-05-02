// Standalone test runner - applies all regex transforms and compares with expected output
// Run with: node tests/run-tests.mjs

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    const re = new RegExp(`import\\s*\\{[^}]*\\}\\s*from\\s*["']${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\s*;?\\n?`, 'g');
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
    // Only in import destructuring
    const re = new RegExp(`(import\\s*\\{[^}]*?)\\b${old}\\b([^}]*\\})`, 'g');
    s = s.replace(re, `$1${rep}$2`);
  }

  // Deduplicate renamed imports (e.g., "Signature, Signature" -> "Signature")
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

  // ethers.utils.RLP/base64/base58
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

  // === 03-BIGNUMBER ===
  s = s.replace(/BigNumber\.from\(/g, 'BigInt(');
  s = s.replace(/BigInt\(([^)]+)\)\.toHexString\(\)/g, 'toBeHex($1)');

  // Remove BigNumber from imports (use \b to avoid matching BigNumberish)
  s = s.replace(/import\s*\{[^}]*BigNumber[^}]*\}\s*from\s*["']ethers["']\s*;?\n?/g, (m) => {
    const cleaned = m.replace(/\bBigNumber\b\s*,?\s*/g, '').replace(/,\s*}/g, ' }').replace(/\{\s*,/g, '{');
    if (cleaned.match(/import\s*\{\s*\}\s*from/)) return '';
    return cleaned;
  });

  // BigNumber methods -> operators (context-aware to avoid chai false positives)
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
  // .toNumber() on a variable -> Number(variable)
  s = s.replace(/(\w+)\.toNumber\(\)/g, 'Number($1)');
  // .toHexString() on a variable -> "0x" + variable.toString(16)
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

  // AbiCoder.defaultAbiCoder property -> function call
  s = s.replace(/AbiCoder\.defaultAbiCoder\b(?!\(\))/g, 'AbiCoder.defaultAbiCoder()');
  s = s.replace(/ethers\.utils\.defaultAbiCoder\b(?!\(\))/g, 'ethers.AbiCoder.defaultAbiCoder()');

  // Interface.getSighash -> getFunction().selector
  s = s.replace(/\.getSighash\(([^)]+)\)/g, '.getFunction($1).selector');

  // Wallet -> HDNodeWallet
  s = s.replace(/Wallet\.fromMnemonic\(/g, 'HDNodeWallet.fromMnemonic(');
  s = s.replace(/Wallet\.createRandom\(/g, 'HDNodeWallet.createRandom(');
  s = s.replace(/Wallet\.fromSeed\(/g, 'HDNodeWallet.fromSeed(');
  s = s.replace(/\bHDNode\b(?!Wallet)/g, 'HDNodeWallet');

  // === 08-SIGNATURES ===
  s = s.replace(/\bsplitSignature\(/g, 'Signature.from(');
  s = s.replace(/\bjoinSignature\(([^)]+)\)/g, 'Signature.from($1).serialized');
  s = s.replace(/\bparseTransaction\(/g, 'Transaction.from(');
  // Two-arg serializeTransaction: serializeTransaction(tx, sig)
  s = s.replace(/\bserializeTransaction\((\w+),\s*(\w+)\)/g, 'Transaction.from({ ...$1, signature: $2 }).serialized');
  // One-arg serializeTransaction: serializeTransaction(tx)
  s = s.replace(/\bserializeTransaction\((\w+)\)/g, 'Transaction.from($1).serialized');

  // Add missing imports
  if (s.includes('Signature.from(') && !/import\s*\{[^}]*\bSignature\b/.test(s)) {
    s = `import { Signature } from "ethers";\n${s}`;
  }
  if (s.includes('Transaction.from(') && !/import\s*\{[^}]*\bTransaction\b/.test(s)) {
    s = `import { Transaction } from "ethers";\n${s}`;
  }

  // Clean up empty lines
  s = s.replace(/\n{3,}/g, '\n\n');

  return s;
}

function normalize(s) {
  return s.replace(/\r\n/g, '\n').replace(/\t/g, '  ').trim();
}

// Run tests
const testsDir = __dirname;
let passed = 0;
let failed = 0;

const dirs = readdirSync(testsDir).filter(d => {
  const p = join(testsDir, d);
  return statSync(p).isDirectory() && d !== 'node_modules';
});

for (const dir of dirs) {
  const inputPath = join(testsDir, dir, 'input.ts');
  const expectedPath = join(testsDir, dir, 'expected.ts');

  try {
    const input = readFileSync(inputPath, 'utf8');
    const expected = readFileSync(expectedPath, 'utf8');

    const result = applyAllTransforms(input);
    const normResult = normalize(result);
    const normExpected = normalize(expected);

    if (normResult === normExpected) {
      console.log(`✅ ${dir}: PASS`);
      passed++;
    } else {
      console.log(`❌ ${dir}: FAIL`);
      // Show diff
      const resultLines = normResult.split('\n');
      const expectedLines = normExpected.split('\n');
      const maxLen = Math.max(resultLines.length, expectedLines.length);
      for (let i = 0; i < maxLen; i++) {
        const r = resultLines[i] || '';
        const e = expectedLines[i] || '';
        if (r !== e) {
          console.log(`  Line ${i + 1}:`);
          console.log(`    GOT:      ${r}`);
          console.log(`    EXPECTED: ${e}`);
        }
      }
      failed++;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`⏭️  ${dir}: skipped (missing files)`);
    } else {
      console.log(`💥 ${dir}: ERROR - ${err.message}`);
      failed++;
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${passed + failed} tests`);
process.exit(failed > 0 ? 1 : 0);
