# Alephium Explorer - Front-end

A blockchain explorer front-end for Alephium.

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

Everything is managed with NPM.

- Install dependencies: `npm install`
- Starting the project: `env $(cat .env.placeholder | xargs) npm run start`
- Building the project: `npm run build`
- Run the tests: `npm run test`
- Lint and fix: `npm run lint:fix`

See `package.json`'s `script` property for more options.

**Note**: You will probably want to change the variables in `.env.placeholder`
to use your local `explorer-backend`.

## Release

To release a new version:

1. Checkout the master branch:
   ```shell
   git checkout master
   ```
2. Create a commit that updates the package version in package.json and package-lock.json and a tag with:
   ```shell
   npm version patch # if you want to bump the patch version
   npm version minor # if you want to bump the minor version
   npm version major # if you want to bump the major version
   npm version prepatch --preid=rc # if you want to create a release candidate and bump the patch version
   npm version preminor --preid=rc # if you want to create a release candidate and bump the minor version
   npm version premajor --preid=rc # if you want to create a release candidate and bump the major version
   ```
3. Push the new commit and new tag to GitHub:
   ```shell
   git push
   git push [remote] <tag>
   ```
4. Create a GitHub release

## Notes

This project uses [@alephium/sdk](https://github.com/alephium/js-sdk).
Please down the package to refer to it as documentation for the network request
methods (`api/api-explorer.ts`).
