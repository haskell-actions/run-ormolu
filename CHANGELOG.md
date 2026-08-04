## Ormolu action v21

* Rewrote the action in TypeScript (`src/index.ts`), bundled into
  `dist/index.js` with `ncc`. No change in behavior or inputs.
* Added a reproducible build with Nix (`flake.nix`): `nix build` produces the
  bundled `dist/` hermetically, and `nix develop` provides a pinned Node.js
  dev shell. CI now verifies that the committed `dist/` matches a fresh build.
* Updated the `@actions/*` dependencies to their current major versions. As
  a side effect, `@actions/tool-cache` 2.x pulls in `undici`, which
  increases the size of the bundled `dist/index.js`. This does not affect
  the action's runtime performance.

## Ormolu action v20

* Switch to the new official upstream of the project and default to the
  version 0.8.2.0.

## Ormolu action v19

* Specifies that it wants to run on Node.js 24 explicitly, so you won't be
  getting any warnings about Node.js 20 anymore.

## Ormolu action v18

* Use Ormolu 0.8.1.1 as the latest version.

## Ormolu action v17

* Uses Ormolu 0.8.0.0 as the latest version.

## Ormolu action v16

* Uses Ormolu 0.7.7.0 as the latest version. On MacOS runners aarch64
  version of Ormolu will be used.

## Ormolu action v15

* Uses Ormolu 0.7.4.0 as the latest version.

## Ormolu action v14

* Added the `mode` input. [PR
  29](https://github.com/haskell-actions/run-ormolu/pull/29).

## Ormolu action v13

* Uses Ormolu 0.7.1.0 as the latest version.

## Ormolu action v12

* Uses Ormolu 0.7.0.0 as the latest version.

## Ormolu action v11

* Added the `version` input which allows the user to select the Ormolu
  version explicitly. It defaults to the latest version known.

## Ormolu action v10

* Uses Ormolu 0.5.3.0.

## Ormolu action v9

* Uses Ormolu 0.5.2.0.

## Ormolu action v8

* Uses Ormolu 0.5.1.0.

## Ormolu action v7

* Uses Ormolu 0.5.0.1.

## Ormolu action v6

* Uses Ormolu 0.5.0.0.

## Ormolu action v5

* Uses Ormolu 0.4.0.0.

## Ormolu action v4

* Uses Ormolu 0.3.0.1.
* Added the new optional input `respect-cabal-files`.

## Ormolu action v3

* Uses Ormolu 0.2.0.0.

## Ormolu action v2

* Fixed the issue with the action hanging when the glob patterns match no
  files. [Issue 3](https://github.com/mrkkrp/ormolu-action/issues/3).

## Ormolu action v1

* Initial release.
