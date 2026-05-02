# ethers-v5-to-v6

> Automated codemod for migrating ethers.js v5 to v6. 89.6% automation. Zero false positives. Tested on Uniswap.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

ethers.js v6 is a complete rewrite — new import structure, BigNumber replaced with native bigint, contract patterns changed, provider/signer APIs renamed. Every ethers.js v5 project faces a massive, error-prone migration. There's no comprehensive tool to automate this.

## The Solution

`ethers-v5-to-v6-codemod` automates 89.6% of the migration:

```
Before (v5)                           After (v6)
─────────────────────────────────────────────────────────────
import { BigNumber }              →  // BigNumber removed
  from '@ethersproject/           →  // Use native bigint
  bignumber'                      →
                                  →  import { ethers } from
import { ethers } from               'ethers'
  '@ethersproject/ethers'        →
                                  →  const bal = BigInt(100)
const bal =                       →
  BigNumber.from(100)             →  // Direct method calls
                                  →  await contract
await contract                        .transfer.staticCall()
  .callStatic.transfer()          →
                                  →  ethers.ZeroAddress
ethers.constants.AddressZero      →
                                  →  ethers.AbstractSigner
ethers.Signer                     →
                                  →  ethers.BrowserProvider
ethers.providers.Web3Provider     →
```

## Key Innovation: Context-Aware BigNumber Transforms

The most dangerous part of the migration is BigNumber arithmetic. Naive regex replacement of `.add()`, `.sub()`, `.mul()`, `.div()` creates false positives with Chai's assertion API. Our solution:

```
┌─────────────────────────────────────────────────────────────┐
│              CONTEXT-AWARE BIGNUMBER TRANSFORM               │
├─────────────────────────────────────────────────────────────┤
│  ✅ Safe (BigNumber.from pattern):                          │
│     BigNumber.from(x).add(y)  →  BigInt(x) + y             │
│     BigNumber.from(x).mul(2)  →  BigInt(x) * 2n            │
│                                                             │
│  ⚠️  Left for AI agent (variable pattern):                  │
│     balance.mul(2)  →  needs type info to verify            │
│                                                             │
│  ❌ Never touched (Chai assertions):                        │
│     expect(x).to.equal(y).div(2)  →  unchanged             │
└─────────────────────────────────────────────────────────────┘
```

## 8-Step Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  01. Import  │ →  │  02. Namespace│ → │  03. BigNum  │ →  │  04. Contract│
│  Paths       │    │  Flattening  │    │  → bigint    │    │  Patterns    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       ↓                   ↓                   ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  05. Provider│ →  │  06. Utility │ →  │  07. Constants│ → │  08. Signatures│
│  Signer      │    │  Functions   │    │  Migration   │    │  & Transaction│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

## Real-World Validation

Tested on **Uniswap v3-periphery** (Uniswap/v3-periphery, 1,300+ stars):

| Metric | Value |
|--------|-------|
| Files analyzed | 41 |
| Files migrated | 27 |
| Lines modified | ~2,700 |
| Patterns found | 451 |
| Auto-transformed | 404 |
| Automation rate | 89.6% |
| False positives | 0 |

## Coverage Breakdown

| Category | Found | Transformed | Coverage |
|----------|-------|-------------|----------|
| Import paths | 156 | 156 | 100% |
| Namespace flattening | 48 | 48 | 100% |
| BigNumber.from() | 89 | 89 | 100% |
| BigNumber arithmetic | 34 | 34 | 100% |
| Contract patterns | 12 | 12 | 100% |
| Provider/Signer | 8 | 8 | 100% |
| Utility functions | 23 | 23 | 100% |
| Constants | 31 | 31 | 100% |
| Signatures | 3 | 3 | 100% |

## Usage

```bash
npx codemod run ethers-v5-to-v6-codemod-gaibianshiji
```

Or run directly:

```bash
node migrate.mjs <target-directory>
```

## Testing

```bash
node tests/run-tests.mjs
```

```
✅ 01-imports: PASS
✅ 02-namespaces: PASS
✅ 03-bignumber: PASS
✅ 04-contracts: PASS
✅ 05-providers: PASS
✅ 06-utilities: PASS
✅ 08-signatures: PASS
✅ integration: PASS

8 passed, 0 failed out of 8 tests
```

## What's NOT Automated

These require type information or semantic understanding:

- Variable BigNumber arithmetic: `balance.mul(2)` → `balance * 2`
- Removed APIs: `commify()`, `poll()`, `checkProperties()`
- Error code type changes (numeric → string)
- `provider.getNetwork().chainId` type change (number → bigint)

## Case Study

See [CASE_STUDY.md](./CASE_STUDY.md) for the full migration analysis.

## License

MIT
