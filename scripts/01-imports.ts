import type { SgRoot, SgNode } from "codemod:ast-grep";

// Maps @ethersproject/* sub-packages to "ethers"
const SUB_PACKAGE_MAP: Record<string, string> = {
  "@ethersproject/abi": "ethers",
  "@ethersproject/abstract-provider": "ethers",
  "@ethersproject/abstract-signer": "ethers",
  "@ethersproject/address": "ethers",
  "@ethersproject/base64": "ethers",
  "@ethersproject/basex": "ethers",
  "@ethersproject/bytes": "ethers",
  "@ethersproject/constants": "ethers",
  "@ethersproject/contracts": "ethers",
  "@ethersproject/hash": "ethers",
  "@ethersproject/hdnode": "ethers",
  "@ethersproject/json-wallets": "ethers",
  "@ethersproject/keccak256": "ethers",
  "@ethersproject/networks": "ethers",
  "@ethersproject/pbkdf2": "ethers",
  "@ethersproject/properties": "ethers",
  "@ethersproject/providers": "ethers",
  "@ethersproject/random": "ethers",
  "@ethersproject/rlp": "ethers",
  "@ethersproject/sha2": "ethers",
  "@ethersproject/signing-key": "ethers",
  "@ethersproject/solidity": "ethers",
  "@ethersproject/strings": "ethers",
  "@ethersproject/transactions": "ethers",
  "@ethersproject/units": "ethers",
  "@ethersproject/wallet": "ethers",
  "@ethersproject/web": "ethers",
  "@ethersproject/wordlists": "ethers",
};

// Packages that are completely removed in v6 (no replacement)
const REMOVED_PACKAGES = [
  "@ethersproject/bignumber",
  "@ethersproject/logger",
];

// Import name renames (v5 name -> v6 name)
const IMPORT_NAME_MAP: Record<string, string> = {
  "arrayify": "getBytes",
  "splitSignature": "Signature",
  "joinSignature": "Signature",
  "parseTransaction": "Transaction",
  "serializeTransaction": "Transaction",
  "defineReadOnly": "defineProperties",
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
  "_TypedDataEncoder": "TypedDataEncoder",
  "getContractAddress": "getCreateAddress",
  "formatAddress": "getAddress",
  "Web3Provider": "BrowserProvider",
  "BaseProvider": "AbstractProvider",
  "IpcProvider": "IpcSocketProvider",
  "Signer": "AbstractSigner",
  "HDNode": "HDNodeWallet",
  "AddressZero": "ZeroAddress",
  "HashZero": "ZeroHash",
  "getNetwork": "Network",
  "fetchJson": "FetchRequest",
};

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  const edits: any[] = [];

  // Find all import declarations
  const imports = rootNode.findAll({
    rule: {
      kind: "import_statement",
    },
  });

  for (const imp of imports) {
    const text = imp.text();

    // Handle @ethersproject/* sub-package imports
    for (const [pkg, target] of Object.entries(SUB_PACKAGE_MAP)) {
      if (text.includes(`"${pkg}"`) || text.includes(`'${pkg}'`)) {
        // Skip removed packages entirely
        if (REMOVED_PACKAGES.includes(pkg)) {
          edits.push(imp.replace(`// REMOVED in v6: ${text}`));
          break;
        }

        // Replace the import source
        const newText = text
          .replace(`"${pkg}"`, `"${target}"`)
          .replace(`'${pkg}'`, `'${target}'`);
        edits.push(imp.replace(newText));
        break;
      }
    }

    // Handle destructured imports from "ethers" (e.g., import { providers } from "ethers")
    if (text.includes('"ethers"') || text.includes("'ethers'")) {
      // Check for deprecated namespace imports
      if (text.includes("providers") || text.includes("utils") || text.includes("constants")) {
        // These are handled by the namespace flattening script (02-namespaces.ts)
      }
    }
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
}
