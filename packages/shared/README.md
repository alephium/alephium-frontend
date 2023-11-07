# Alephium js-sdk

[![Github CI][test-badge]][test-link]
[![Code Coverage][coverage-badge]][coverage-link]
[![NPM][npm-badge]][npm-link]
[![code style: prettier][prettier-badge]][prettier-link]

A JavaScript/TypeScript library for building applications that interact the Alephium platform.

## Install

### In Node projects

```shell
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

### In browser projects

All you have to do is to include the library in your HTML document. The `alephium` global variable will be available.

```html
<script src="alephium.min.js"></script>
<script>
  const { walletGenerate } = alephium
  const wallet = walletGenerate()
  console.log(wallet)
</script>
```

You can either build the library by cloning this repo and running the build script (the file will be located at `/dist/alephium.min.js`), or simply using a CDN.

```shell
npm run build
```

#### via UNPKG CDN

```html
<script src="https://unpkg.com/@alephium/sdk@X.Y.Z/dist/alephium.min.js"></script>
```

#### via jsDelivr CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@alephium/sdk@X.Y.Z/dist/alephium.min.js"></script>
```

## Development

### Release

To release a new version:

1. Create a commit that updates the package version in package.json and package-lock.json and a tag with:
   ```shell
   npm version patch # if you want to bump the patch version, without breaking changes
   npm version minor # if you want to bump the minor version, with breaking changes
   npm version prerelease --preid=rc # if you want to create a release candidate
   ```
2. Push the tag to GitHub and trigger the publish workflow that will publish it on NPM with:

   ```shell
   git push [remote] <tag>
   ```

3. Unless you are on `master`, create a new branch and push it to GitHub so that the tagged commit belongs to a branch of this repo with:
   ```shell
   git checkout -b <tag>
   git push
   ```
   Otherwise, just push to `master`.

## Build

Compile the TypeScript files into JavaScript:

```shell
npm run build
```

## Testing

```shell
npm run devnet:start # this will start a devnet for smart contract tests
npm test
```

or, to watch for changes:

```shell
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
[release-notes]: https://github.com/alephium/js-sdk/releases
[1]: https://github.com/facebook/create-react-app/blob/2da5517689b7510ff8d8b0148ce372782cb285d7/packages/react-scripts/scripts/init.js#L264-L278
