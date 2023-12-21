# Alephium frontend

A monorepo containing all things frontend on Alephium.

## Development

We use [Bun](https://bun.sh/) as our package manager and [Turborepo](https://turbo.build/repo) as our build system. Turborepo runs the tasks defined in `turbo.json` and Bun installs the npm packages.

Install all dependencies with:

```shell
bun install
```

Turbo tasks are defined in `turbo.json`. You can execute them from the root directory of the monorepo:

```shell
turbo [task]
```

or from any workspace directory:

```shell
# equivalent to `turbo [task] --filter=[app]`
cd apps/[app]
turbo [task]
```

Compile the packages:

```shell
turbo compile
```

### Lint

```shell
turbo lint
turbo lint:fix
```

### Format

```shell
bun format
```

### Compile TypeScript

```shell
turbo typecheck
```

### Test

```shell
turbo test
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
