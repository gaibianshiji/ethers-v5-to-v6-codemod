import type { SgRoot, SgNode } from "codemod:ast-grep";

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // contract.callStatic.methodName(args) -> contract.methodName.staticCall(args)
  const callStaticPattern = /\.callStatic\.(\w+)\(/g;
  if (callStaticPattern.test(source)) {
    source = source.replace(/\.callStatic\.(\w+)\(/g, ".$1.staticCall(");
    changed = true;
  }

  // contract.estimateGas.methodName(args) -> contract.methodName.estimateGas(args)
  const estimateGasPattern = /\.estimateGas\.(\w+)\(/g;
  if (estimateGasPattern.test(source)) {
    source = source.replace(/\.estimateGas\.(\w+)\(/g, ".$1.estimateGas(");
    changed = true;
  }

  // contract.populateTransaction.methodName(args) -> contract.methodName.populateTransaction(args)
  const populateTxPattern = /\.populateTransaction\.(\w+)\(/g;
  if (populateTxPattern.test(source)) {
    source = source.replace(/\.populateTransaction\.(\w+)\(/g, ".$1.populateTransaction(");
    changed = true;
  }

  // contract.functions.methodName(args) -> contract.methodName.staticCallResult(args)
  const functionsPattern = /\.functions\.(\w+)\(/g;
  if (functionsPattern.test(source)) {
    source = source.replace(/\.functions\.(\w+)\(/g, ".$1.staticCallResult(");
    changed = true;
  }

  // contract.deployTransaction -> contract.deploymentTransaction()
  if (source.includes(".deployTransaction")) {
    source = source.replace(/\.deployTransaction\b/g, ".deploymentTransaction()");
    changed = true;
  }

  // contract.address -> contract.target (optional, address still works)
  // Only replace in specific contexts where .target is required
  // source = source.replace(/\.address\b/g, ".target");

  if (changed) {
    return source;
  }
  return null;
}
