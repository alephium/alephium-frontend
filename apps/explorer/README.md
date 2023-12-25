# Alephium Explorer - frontend

A blockchain explorer frontend for Alephium.

## Features

- Switch between main and test networks
- Search for an address or transaction
- List blocks
  - Hash, timestamp, height, number of TX, and chain index
- Transaction view
  - Hash, status, block hash, timestamp, inputs, outputs, gas, TX fee
- Address view
  - Address, number of transactions, total balance, locked balance, history
- Statistics
  - Hashrate, supply, transactions, blocks, number of chains

## Development

- Install dependencies from the root of the monorepo: `pnpminstall`
- Starting the project: `env $(cat .env.placeholder | xargs) turbo run start`
- Building the project: `turbo run build`
- Run the tests: `turbo test`
- Lint and fix: `turbo lint:fix`

See `package.json`'s `script` property for more options.

**Note**: You will probably want to change the variables in `.env.placeholder`
to use your local `explorer-backend`.

## Release

Please refer to the instructions visible [in the README](/README.md#releasing) situated at the root of the monorepo.
