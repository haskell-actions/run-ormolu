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
* `follow-symbolic-links` Whether to follow symbolic links.
* `extra-args` Extra arguments to pass to Ormolu.

## Example usage

In the simple case all you need to do is to add this step to your job:

```yaml
- uses: mrkkrp/ormolu-action@v2
```

However, if you are using a matrix, then it is more efficient to have a
separate job for checking of formatting:

```yaml
jobs:
  ormolu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: mrkkrp/ormolu-action@v2
  build:
    runs-on: ubuntu-latest
    needs: ormolu
    ...
```

Here, the `build` job depends on `ormolu` and will not run unless `ormolu`
passes.

[ormolu]: https://github.com/tweag/ormolu
