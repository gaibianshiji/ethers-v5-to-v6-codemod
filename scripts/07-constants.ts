import type { SgRoot, SgNode } from "codemod:ast-grep";

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // ethers.constants.X -> ethers.X or literal values
  const constantRenames: Record<string, string> = {
    "AddressZero": "ZeroAddress",
    "HashZero": "ZeroHash",
    "EtherSymbol": "EtherSymbol",
    "MessagePrefix": "MessagePrefix",
    "MaxUint256": "MaxUint256",
    "WeiPerEther": "WeiPerEther",
    "MinInt256": "MinInt256",
    "MaxInt256": "MaxInt256",
  };

  // Direct renames (property to property)
  for (const [old, newName] of Object.entries(constantRenames)) {
    const pattern = new RegExp(`ethers\\.constants\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, `ethers.${newName}`);
      changed = true;
    }
  }

  // Constants that become bigint literals
  const literalRenames: Record<string, string> = {
    "NegativeOne": "(-1n)",
    "Zero": "(0n)",
    "One": "(1n)",
    "Two": "(2n)",
  };

  for (const [old, literal] of Object.entries(literalRenames)) {
    const pattern = new RegExp(`ethers\\.constants\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, literal);
      changed = true;
    }
  }

  // Handle destructured imports: import { constants } from "ethers"
  // Then usage: constants.AddressZero -> ethers.ZeroAddress
  for (const [old, newName] of Object.entries(constantRenames)) {
    const pattern = new RegExp(`constants\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, `ethers.${newName}`);
      changed = true;
    }
  }

  for (const [old, literal] of Object.entries(literalRenames)) {
    const pattern = new RegExp(`constants\\.${old}\\b`, "g");
    if (pattern.test(source)) {
      source = source.replace(pattern, literal);
      changed = true;
    }
  }

  if (changed) {
    return source;
  }
  return null;
}
