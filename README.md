# Ormolu action

[![CI](https://github.com/haskell-actions/run-ormolu/actions/workflows/ci.yaml/badge.svg)](https://github.com/haskell-actions/run-ormolu/actions/workflows/ci.yaml)

This is Ormolu action that helps to ensure that your Haskell project is
formatted with [Ormolu][ormolu]. The action tries to find all Haskell source
code files in your repository and fails if any of them is not formatted. In
case of failure it prints the diff between the actual contents of the file
and its formatted version.

## Inputs

* `pattern` Glob patterns that are used to find source files to format. It
  is possible to specify several patterns by putting [each on a new
  line][multiple-patterns-example] (notice no quotes around the globs).
* `respect-cabal-files` Whether to try to locate Cabal files and take into
  account their `default-extensions` and `default-language` settings
  (default: true).
* `follow-symbolic-links` Whether to follow symbolic links (default: true).
* `mode` Specifies whether to simply `"check"` files for formatting, or
  modify the files `"inplace"`.
* `extra-args` Extra arguments to pass to Ormolu.
* `version` The version number of Ormolu to use. Defaults to `"latest"`.

## Windows

If you are running a workflow on Windows, be wary of [Git's
`core.autocrlf`][git-core-autocrlf]. Ormolu always converts CRLF endings to
LF endings which may result in spurious diffs, so you probably want to
disable `core.autocrlf`:

```shell
$ git config --global core.autocrlf false
```

## Example usage

In the simple case all you need to do is to add this step to your job:

```yaml
- uses: haskell-actions/run-ormolu@v20
```

However, if you are using a matrix, then it is more efficient to have a
separate job for checking of formatting:

```yaml
jobs:
  ormolu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: haskell-actions/run-ormolu@v20
  build:
    runs-on: ubuntu-latest
    needs: ormolu
    ...
```

Here, the `build` job depends on `ormolu` and will not run unless `ormolu`
passes.

## Development

The action is written in TypeScript (`src/index.ts`) and bundled into a
single JavaScript file (`dist/index.js`) with [`ncc`][ncc]. The `dist/`
directory is committed to the repository because the GitHub Actions runner
executes the bundled output directly.

The build is reproducible with [Nix][nix] (flakes must be enabled):

```shell
# Enter a dev shell with a pinned Node.js and build the bundle:
$ nix develop
$ npm ci
$ npm run prepare

# Or produce the bundle hermetically without a dev shell:
$ nix build   # result/dist/ contains the bundle
```

Whenever you change `src/` or the dependencies, rebuild and commit the
updated `dist/`. CI verifies that the committed `dist/` matches a fresh
`nix build`.

If you change dependencies (`package.json` / `package-lock.json`), the
`npmDepsHash` in `flake.nix` must be updated. Recompute it with:

```shell
$ nix run nixpkgs#prefetch-npm-deps -- package-lock.json
```

[ormolu]: https://github.com/mrkkrp/ormolu
[multiple-patterns-example]: https://github.com/haskell-actions/run-ormolu/blob/master/action.yml#L9-L11
[git-core-autocrlf]: https://www.git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf
[ncc]: https://github.com/vercel/ncc
[nix]: https://nixos.org/

## Example which commits the formatted files:

```yaml
jobs:
  ormolu:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2
      - uses: haskell-actions/run-ormolu@v14
        with:
          mode: inplace
      - name: apply formatting changes
        uses: stefanzweifel/git-auto-commit-action@v4
        if: ${{ always() }}
        with:
          commit_message: automated ormolu commit
```
