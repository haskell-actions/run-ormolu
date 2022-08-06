# Ormolu action

![CI](https://github.com/mrkkrp/ormolu-action/workflows/CI/badge.svg?branch=master)

This is Ormolu action that helps to ensure that your Haskell project is
formatted with [Ormolu][ormolu]. The action tries to find all Haskell source
code files in your repository and fails if any of them is not formatted. In
case of failure it prints the diff between the actual contents of the file
and its formatted version.

## Inputs

* `pattern` Glob pattern that are used to find source files to format. It is
  possible to specify several patterns by putting each on a new line.
* `respect-cabal-files` Whether to try to locate Cabal files and take into
  account their `default-extensions` and `default-language` settings
  (default: true).
* `follow-symbolic-links` Whether to follow symbolic links (default: true).
* `extra-args` Extra arguments to pass to Ormolu.

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
- uses: mrkkrp/ormolu-action@v7
```

However, if you are using a matrix, then it is more efficient to have a
separate job for checking of formatting:

```yaml
jobs:
  ormolu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: mrkkrp/ormolu-action@v7
  build:
    runs-on: ubuntu-latest
    needs: ormolu
    ...
```

Here, the `build` job depends on `ormolu` and will not run unless `ormolu`
passes.

[ormolu]: https://github.com/tweag/ormolu
[git-core-autocrlf]: https://www.git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf
