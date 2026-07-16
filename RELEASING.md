# Releasing

Maintainer notes for cutting a release. If you're looking for how to *use* FlexTable, see the
[docs site](https://github.com/DoniLite/Flextable/tree/main/apps/docs) instead — this file is
about publishing the packages themselves.

## How it works

Versioning and publishing are two deliberately separate steps, driven by two workflows:

1. **[`version.yml`](.github/workflows/version.yml)** runs on every push to `main`. It looks at
   whatever [Changesets](https://github.com/changesets/changesets) are pending and opens (or
   updates) a **"Version Packages" pull request** that bumps the affected packages' versions and
   writes their `CHANGELOG.md` entries. It never publishes anything.
2. **[`release.yml`](.github/workflows/release.yml)** runs only when a **tag is pushed** — not on
   every merge to `main`. It builds, typechecks, tests, and publishes to npm via
   [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) (no `NPM_TOKEN` secret
   involved).

Merging the Version PR bumps versions on `main` but doesn't release anything by itself — pushing a
tag is the deliberate "go" moment.

## Day to day: adding a changeset

Any PR that changes a published package's behavior should include a changeset:

```sh
bun run changeset
```

This prompts for which packages changed and how (`patch` / `minor` / `major`), then writes a
markdown file under `.changeset/`. Commit that file as part of the PR. One changeset can cover
multiple packages if the change touches more than one (e.g. a `core` change that also affects
`react` and `vue`).

Packages that have never been published yet don't need a changeset for their first release — see
[First release of a package](#first-release-of-a-package) below.

## Cutting a release

1. Merge PRs with their changesets as normal. `version.yml` keeps the "Version Packages" PR
   up to date automatically — you don't need to do anything for this step.
2. When you're ready to release everything currently queued up, review and merge the **Version
   Packages** PR. This bumps `package.json` versions and `CHANGELOG.md` files on `main`, and
   deletes the consumed changeset files. Nothing is published yet.
3. Tag the resulting commit and push the tag:

   ```sh
   git checkout main && git pull
   git tag v0.2.0   # match whatever version(s) the Version PR just set
   git push origin v0.2.0
   ```

   `release.yml` triggers on **any** tag push (not just `v*`), so use a real version-shaped tag
   name to avoid confusing an unrelated tag with a release trigger.
4. Watch the `Release` workflow run in the Actions tab. It publishes every package whose local
   version is ahead of what's on npm.

## First release of a package

A package that has never been published doesn't have a "previous version" for a changeset to bump
from — its version in `package.json` (currently `0.1.0` for all seven packages) is the intended
first-publish version directly, not something Changesets manages. Tag and push as in step 3 above
to publish it for the first time; start using changesets for that package from its *next* change
onward.

## One-time setup: npm Trusted Publisher

OIDC trusted publishing requires each package to be configured on npmjs.com *before* the first
publish attempt: for every `@flextable/*` package, add this GitHub repository and the
`release.yml` workflow as a **Trusted Publisher** under the package's npm settings (this has to be
done once per package, and the package must already exist on npm — for a brand-new scope/package
name, publish once manually with `npm publish --access public` from a local machine with npm
auth, then switch it over to trusted publishing for every subsequent release).

Also confirm the `@flextable` npm org/scope used throughout `package.json` is one you actually
own — it's a placeholder chosen early in the migration and is trivial to rename before the first
real publish, but should be settled before setting up trusted publishers.

## Dry-running a release

Before the very first real publish, do a dry run to catch packaging problems without actually
publishing:

```sh
bun run build
cd packages/core && npm publish --dry-run --provenance
```

Repeat per package, or adapt into a loop. `--dry-run` performs every step (packing, provenance
attestation) except the actual upload.
