# Alephium js-sdk

[![Github CI][test-badge]][test-link]
[![Code Coverage][coverage-badge]][coverage-link]
[![NPM][npm-badge]][npm-link]
[![code style: prettier][prettier-badge]][prettier-link]

A JavaScript/TypeScript library for building decentralized applications on the Alephium platform.

You could run the following command to scaffold a skeleton project for smart contract development.

```
npx @alephium/sdk [name]
```

## Install

```
npm install @alephium/sdk
```

💥 Until our SDK is stable, breaking changes will be introduced in **minor** versions (instead of the traditional major versions of semver). We recommend allowing patch-level updates and to always read the [release notes][release-notes] for breaking changes.

```js
// package.json
{
   "dependencies": {
      "@alephium/sdk": "~X.Y.Z"
   }
}
```

## Development

### Update schemas

One first needs to update the version number of `alephium` and `explorer-backend` in `package.json`. Kindly note that one needs to check the compatibility of both OpenAPI files manually.

Typings can automatically generated using the following command:

```shell
npm run update-schemas
```

### Release

To release a new version:

1. Create a commit that updates the package version in package.json and package-lock.json and a `vX.Y.Z` tag with:
   ```
   npm version X.Y.Z
   ```
2. Push the tag to GitHub and trigger the publish workflow that will publish it on NPM with:

   ```
   git push [remote] vX.Y.Z
   ```

3. Unless you are on `master`, create a new branch and push it to GitHub so that the tagged commit belongs to a branch of this repo with:
   ```
   git checkout -b X.Y.Z
   git push
   ```
   Otherwise, just push to `master`.

## Compile

Compile the TypeScript files into JavaScript:

```
npm run compile
```

## Testing

```
npm run devnet:start // this will start a devnet for smart contract tests
npm test
```

or, to watch for changes:

```
npm run test:watch
```

[test-badge]: https://github.com/alephium/js-sdk/actions/workflows/test.yml/badge.svg
[test-link]: https://github.com/alephium/js-sdk/actions/workflows/test.yml
[coverage-badge]: https://codecov.io/gh/alephium/js-sdk/branch/master/graph/badge.svg
[coverage-link]: https://codecov.io/gh/alephium/js-sdk
[npm-badge]: https://img.shields.io/npm/v/@alephium/sdk.svg
[npm-link]: https://www.npmjs.org/package/@alephium/sdk
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-link]: https://github.com/prettier/prettier
[release-notes]: https://github.com/alephium/alephium-js/releases
