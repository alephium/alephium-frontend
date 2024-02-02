# Alephium frontend

A monorepo containing all things frontend on Alephium.

## Development

Make sure you have [pnpm](https://pnpm.io/) installed in your system.

Install all dependencies for all apps with:

```shell
pnpm install
```

Start the dev server for all shared packages with:

```shell
pnpm watch
```

In a separate terminal window navigate to the app folder you want to work on and follow the instructions there to start developing. The command above will ensure that the apps always get the latest code from the internally shared packages.

### Useful commands

Check if there are any type, linting, or formatting errors in any of the apps and internal packages with:

```shell
pnpm check
```

or more in a more granular approach:

```shell
pnpm typecheck
pnpm lint
pnpm format
```

You can attempt to fix linting errors with:

```shell
pnpm lint:fix
```

#### Test

```shell
pnpm test
```

## Contributing

We use [changeset](https://github.com/changesets/changesets) for managing the versions and changelogs of our projects.

When creating a PR, run the following command to create a [temporary](https://github.com/changesets/changesets/blob/main/docs/common-questions.md#changesets-are-automatically-removed) [editable](https://github.com/changesets/changesets/blob/main/docs/common-questions.md#changesets-are-markdown-files-with-yaml-front-matter) commit-able file under the `./changeset` directory that describes the changes the PR introduces to the projects:

```shell
bunx changeset add # or `bunx changeset` for short
```

[You can add multiple changesets in one PR](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md#you-can-add-more-than-one-changeset-to-a-pull-request).

## Releasing

### Release candidates

```shell
bunx changeset pre enter rc # Enters the pre-release mode
bunx changeset version # Compiles all chancesets into changelogs and bumps the package versions
git add # Add changelogs and version bumps
git commit -m "Bump versions"
bunx changeset tag # Creates tags with new package versions

git push --follow-tags # Push new tags to trigger release candidate GH actions
```

This will trigger the release GitHub actions, but append the `rc` suffix at the end of the tags.

To move on with the production release, first exit the `pre` mode with:

```shell
bunx changeset pre exit
```

and then delete all the files and diff that was generated while in the "pre-release" mode.

### Production

Create a PR that includes the bump'ed versions:

```shell
git checkout master
git pull origin master
git checkout -b bump-versions

bunx changeset version

git add # Add changelogs and version bumps
git commit -m "Bump versions"
git push
```

Once the above PR is merged into `master`, you can create and push the new tags to trigger the release GitHub actions:

```shell
git checkout master
git pull origin master

bunx changeset tag

git push --follow-tags
```
