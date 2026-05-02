import type { SgRoot, SgNode } from "codemod:ast-grep";

export default function transform(root: SgRoot): string | null {
  const rootNode = root.root();
  let source = rootNode.text();
  let changed = false;

  // provider.sendTransaction -> provider.broadcastTransaction
  if (source.includes(".sendTransaction(")) {
    // Only replace on provider objects (not signer - signer.sendTransaction stays)
    // This is a heuristic - replace .sendTransaction that's clearly on a provider
    source = source.replace(
      /provider\.sendTransaction\(/g,
      "provider.broadcastTransaction("
    );
    changed = true;
  }

  // ethers.Signer -> ethers.AbstractSigner (for type references)
  source = source.replace(/\bethers\.Signer\b(?!Name|s)/g, "ethers.AbstractSigner");

  // ethers.providers.StaticJsonRpcProvider(url, network) -> ethers.JsonRpcProvider(url, network, { staticNetwork: network })
  // This is complex and context-dependent - handle the class reference
  source = source.replace(
    /new\s+ethers\.providers\.StaticJsonRpcProvider\(/g,
    "new ethers.JsonRpcProvider("
  );

  // StaticJsonRpcProvider as type -> JsonRpcProvider
  source = source.replace(/\bStaticJsonRpcProvider\b/g, "JsonRpcProvider");

  // provider.getGasPrice() -> (await provider.getFeeData()).gasPrice
  source = source.replace(
    /await\s+provider\.getGasPrice\(\)/g,
    "(await provider.getFeeData()).gasPrice"
  );
  source = source.replace(
    /provider\.getGasPrice\(\)/g,
    "(await provider.getFeeData()).gasPrice"
  );

  if (changed || source !== rootNode.text()) {
    return source;
  }
  return null;
}
