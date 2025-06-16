# Alephium desktop wallet

The official Alephium desktop wallet.

![Wallet preview](https://user-images.githubusercontent.com/1579899/236201682-4e0b0c45-65d3-42c0-b187-d8d6387426d7.png)

## Development

Start by following the development instructions in the [README](../../README.md) of the monorepo.

Then, to start the electron app, run:

```shell
pnpm start

# Alternatively, other helpful scripts to start the app are:
pnpm start:web   # Starts only the renderer process
pnpm start:debug # Inspects React re-renders
```

## Packaging

Based on your OS run the appropriate command:

```shell
pnpm ci:build:electron:windows
pnpm ci:build:electron:macOS
pnpm ci:build:electron:linux
pnpm ci:build:electron:linux:arm64
```

## Releasing

### Releasing a release candidate version

If the current version is `1.0.0` and you want to release the first release candidate or the next minor release, then:

1. Check out the feature branch, or `master`
2. Manually change the version in `package.json` to `1.1.0-rc.0`
3. Commit the change with a message `Bump desktop wallet version to 1.1.0-rc.0`
4. Push to remote
5. Create tag using `pnpm exec changeset tag`
6. Push tag to remote with `git push origin alephium-desktop-wallet@1.1.0-rc.0`
   1. The last step will trigger the GitHub release action and the built files will appear in a draft release on GitHub after a few minutes.
7. Once all files appear in the draft release, edit it to:
   1. Change the tag to the pushed tag
      1. Note: Do not create a new tag that starts with `v`. Instead, search for the existing `alephium-desktop-wallet@1.1.0-rc.0`
   2. Rename release to `Desktop wallet v1.1.0-rc.0`
   3. Copy release body template from another release and update the version and changelog
   4. Set as pre-release

### Releasing a production version

1. All feature branches must have been merged into `master`.
2. Check out `master`
3. Create changelog and bump version with `pnpm exec changeset version`
   1. If more projects in the monorepo got their version updated, you can skip them from the following commit.
4. Continue from step 3 like above (without the `-rc.0` part).
