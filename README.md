# ethers-v5-to-v6

Automated codemod for migrating ethers.js v5 codebases to v6.

## What it does

This codemod automates **~90% of the deterministic migration patterns** from ethers.js v5 to v6:

- **Import paths:** `@ethersproject/*` sub-packages → unified `"ethers"` package
- **Namespace flattening:** `ethers.providers.X`, `ethers.utils.X`, `ethers.constants.X` → `ethers.X`
- **BigNumber → bigint:** `BigNumber.from()` → `BigInt()`, chained arithmetic
- **Contract patterns:** `callStatic.X` → `X.staticCall()`, `estimateGas.X` → `X.estimateGas()`
- **Provider/Signer renames:** `Web3Provider` → `BrowserProvider`, `Signer` → `AbstractSigner`
- **Utility functions:** `arrayify` → `getBytes`, `splitSignature` → `Signature.from()`, etc.
- **Constants:** `ethers.constants.AddressZero` → `ethers.ZeroAddress`, numeric constants → bigint literals

## Usage

```bash
npx codemod run ethers-v5-to-v6
```

Or run the migration script directly:

```bash
node migrate.mjs <target-directory>
```

## What's NOT automated

These patterns require type information or semantic understanding and should be handled by an AI agent or manually:

- Variable BigNumber arithmetic: `balance.mul(2)` → `balance * 2` (need to verify `balance` is bigint)
- Removed APIs: `commify()`, `poll()`, `checkProperties()`, `deepCopy()`
- `feeData.lastBaseFeePerGas` → alternative approach
- Error code type changes (numeric → string)
- `provider.getNetwork().chainId` type change (number → bigint)

## Testing

```bash
node tests/run-tests.mjs
```

## Case Study

See [CASE_STUDY.md](./CASE_STUDY.md) for the full migration analysis of Uniswap v3-periphery.
