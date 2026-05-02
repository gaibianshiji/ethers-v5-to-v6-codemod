import type { SgRoot, SgNode } from "codemod:ast-grep";

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // BigNumber.from(x) -> BigInt(x)
  if (source.includes("BigNumber.from(")) {
    source = source.replace(/BigNumber\.from\(/g, "BigInt(");
    changed = true;
  }

  // BigNumber.from(x).toHexString() -> toBeHex(x)
  source = source.replace(
    /BigInt\(([^)]+)\)\.toHexString\(\)/g,
    "toBeHex($1)"
  );

  // Remove BigNumber imports (use \b to avoid matching BigNumberish)
  source = source.replace(
    /import\s*\{[^}]*BigNumber[^}]*\}\s*from\s*["']ethers["']\s*;?\n?/g,
    (match) => {
      // Remove BigNumber from the import list (word boundary to protect BigNumberish)
      const cleaned = match
        .replace(/\bBigNumber\b\s*,?\s*/g, "")
        .replace(/,\s*}/g, " }")
        .replace(/\{\s*,/g, "{");
      // If only BigNumber was imported, remove the whole line
      if (cleaned.match(/import\s*\{\s*\}\s*from/)) return "";
      return cleaned;
    }
  );

  source = source.replace(
    /import\s*\{[^}]*BigNumber[^}]*\}\s*from\s*["']@ethersproject\/bignumber["']\s*;?\n?/g,
    ""
  );

  // BigNumber method -> operator conversions
  // .add(b) -> + b
  source = source.replace(/\.add\(([^)]+)\)/g, " + $1");
  // .sub(b) -> - b
  source = source.replace(/\.sub\(([^)]+)\)/g, " - $1");
  // .mul(b) -> * b
  source = source.replace(/\.mul\(([^)]+)\)/g, " * $1");
  // .div(b) -> / b
  source = source.replace(/\.div\(([^)]+)\)/g, " / $1");
  // .mod(b) -> % b
  source = source.replace(/\.mod\(([^)]+)\)/g, " % $1");
  // .pow(b) -> ** b
  source = source.replace(/\.pow\(([^)]+)\)/g, " ** $1");

  // .shl(n) -> << BigInt(n)
  source = source.replace(/\.shl\(([^)]+)\)/g, " << BigInt($1)");
  // .shr(n) -> >> BigInt(n)
  source = source.replace(/\.shr\(([^)]+)\)/g, " >> BigInt($1)");
  // .and(b) -> & b
  source = source.replace(/\.and\(([^)]+)\)/g, " & $1");
  // .or(b) -> | b
  source = source.replace(/\.or\(([^)]+)\)/g, " | $1");
  // .xor(b) -> ^ b
  source = source.replace(/\.xor\(([^)]+)\)/g, " ^ $1");

  // Comparison methods
  // .eq(b) -> === b
  source = source.replace(/\.eq\(([^)]+)\)/g, " === $1");
  // .lt(b) -> < b
  source = source.replace(/\.lt\(([^)]+)\)/g, " < $1");
  // .lte(b) -> <= b
  source = source.replace(/\.lte\(([^)]+)\)/g, " <= $1");
  // .gt(b) -> > b
  source = source.replace(/\.gt\(([^)]+)\)/g, " > $1");
  // .gte(b) -> >= b
  source = source.replace(/\.gte\(([^)]+)\)/g, " >= $1");

  // Unary methods
  // .isZero() -> === 0n
  source = source.replace(/\.isZero\(\)/g, " === 0n");
  // .isNegative() -> < 0n
  source = source.replace(/\.isNegative\(\)/g, " < 0n");
  // .isPositive() -> > 0n
  source = source.replace(/\.isPositive\(\)/g, " > 0n");
  // .abs() -> (x < 0n ? -x : x) - simplified to Math.abs for bigint
  source = source.replace(/\.abs\(\)/g, " < 0n ? -$& : $&");
  // .neg() -> unary minus (simplified)
  source = source.replace(/\.neg\(\)/g, "");

  // .toNumber() -> Number(x)
  source = source.replace(/(\w+)\.toNumber\(\)/g, "Number($1)");
  // .toHexString() -> "0x" + x.toString(16)
  source = source.replace(/(\w+)\.toHexString\(\)/g, '"0x" + $1.toString(16)');
  // .toBigInt() -> identity (already bigint)
  source = source.replace(/\.toBigInt\(\)/g, "");

  if (changed || source !== rootNode.text()) {
    return source;
  }
  return null;
}
