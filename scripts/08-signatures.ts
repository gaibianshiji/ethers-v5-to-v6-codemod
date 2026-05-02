import type { SgRoot, SgNode } from "codemod:ast-grep";

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // splitSignature(bytes) -> Signature.from(bytes)
  if (source.includes("splitSignature(")) {
    source = source.replace(/\bsplitSignature\(/g, "Signature.from(");
    changed = true;
  }

  // joinSignature(sig) -> Signature.from(sig).serialized
  if (source.includes("joinSignature(")) {
    source = source.replace(/\bjoinSignature\(([^)]+)\)/g, "Signature.from($1).serialized");
    changed = true;
  }

  // parseTransaction(bytes) -> Transaction.from(bytes)
  if (source.includes("parseTransaction(")) {
    source = source.replace(/\bparseTransaction\(/g, "Transaction.from(");
    changed = true;
  }

  // serializeTransaction(tx) -> Transaction.from(tx).serialized
  // serializeTransaction(tx, sig) -> Transaction.from({ ...tx, signature: sig }).serialized
  if (source.includes("serializeTransaction(")) {
    // Handle two-arg version first (use \w+ to avoid greedy matching)
    source = source.replace(
      /\bserializeTransaction\((\w+),\s*(\w+)\)/g,
      "Transaction.from({ ...$1, signature: $2 }).serialized"
    );
    // Handle one-arg version
    source = source.replace(
      /\bserializeTransaction\((\w+)\)/g,
      "Transaction.from($1).serialized"
    );
    changed = true;
  }

  // Remove splitSignature/joinSignature imports from ethers
  source = source.replace(
    /import\s*\{([^}]*)\b(splitSignature|joinSignature)\b([^}]*)\}\s*from\s*["']ethers["']\s*;?\n?/g,
    (match, before, fn, after) => {
      const cleaned = (before + after)
        .replace(/,\s*,/g, ",")
        .replace(/^\s*,\s*/g, "")
        .replace(/\s*,\s*$/g, "")
        .trim();
      if (!cleaned || cleaned === ",") return "";
      return `import { ${cleaned} } from "ethers";\n`;
    }
  );

  // Add Signature import if we used Signature.from
  if (source.includes("Signature.from(") && !source.includes("Signature") ) {
    // Check if Signature is already imported
    const hasSignatureImport = /import\s*\{[^}]*\bSignature\b[^}]*\}\s*from\s*["']ethers["']/.test(source);
    if (!hasSignatureImport) {
      source = `import { Signature } from "ethers";\n${source}`;
    }
  }

  // Add Transaction import if we used Transaction.from
  if (source.includes("Transaction.from(")) {
    const hasTransactionImport = /import\s*\{[^}]*\bTransaction\b[^}]*\}\s*from\s*["']ethers["']/.test(source);
    if (!hasTransactionImport) {
      source = `import { Transaction } from "ethers";\n${source}`;
    }
  }

  if (changed) {
    return source;
  }
  return null;
}
