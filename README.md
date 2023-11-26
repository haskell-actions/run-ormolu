# Ormolu action

![CI](https://github.com/mrkkrp/ormolu-action/workflows/CI/badge.svg?branch=master)

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
- uses: haskell-actions/run-ormolu@v14
```

However, if you are using a matrix, then it is more efficient to have a
separate job for checking of formatting:

```yaml
jobs:
  ormolu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: haskell-actions/run-ormolu@v14
  build:
    runs-on: ubuntu-latest
    needs: ormolu
    ...
```

Here, the `build` job depends on `ormolu` and will not run unless `ormolu`
passes.

[ormolu]: https://github.com/tweag/ormolu
[multiple-patterns-example]: https://github.com/haskell-actions/run-ormolu/blob/master/action.yml#L9-L11
[git-core-autocrlf]: https://www.git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf

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
