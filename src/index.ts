import * as path from 'path';
import * as core from '@actions/core';
import * as tool_cache from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as glob from '@actions/glob';

const DEFAULT_ORMOLU_VERSION = '0.8.2.0';

function ormoluUrl(version: string, asset: string): string {
  return `https://github.com/mrkkrp/ormolu/releases/download/${version}/${asset}`;
}

function assetForPlatform(): string {
  switch (process.platform) {
    case 'win32':
      return 'ormolu-x86_64-windows.zip';
    case 'darwin':
      return 'ormolu-aarch64-darwin.zip';
    default:
      return 'ormolu-x86_64-linux.zip';
  }
}

async function run(): Promise<void> {
  const inputVersion = core.getInput('version');
  const ormoluVersion =
    inputVersion === 'latest' ? DEFAULT_ORMOLU_VERSION : inputVersion;

  const inputPattern = core.getInput('pattern');
  const respectCabalFiles =
    core.getInput('respect-cabal-files').toUpperCase() !== 'FALSE';
  const followSymbolicLinks =
    core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE';
  const mode = core.getInput('mode').toLowerCase();
  const inputExtraArgs = core.getInput('extra-args');

  // Download and unpack the Ormolu archive.

  const url = ormoluUrl(ormoluVersion, assetForPlatform());
  const ormoluArchive = await tool_cache.downloadTool(url);

  const extractedDir = process.env['RUNNER_TEMP'];
  if (!extractedDir) {
    throw new Error('The RUNNER_TEMP environment variable is not set');
  }
  await tool_cache.extractZip(ormoluArchive, extractedDir);

  // Cache the Ormolu executable.

  const cachedDir = await tool_cache.cacheDir(
    extractedDir,
    'ormolu',
    ormoluVersion
  );
  const ormoluPath = path.join(cachedDir, 'ormolu');

  await exec.exec('chmod', ['+x', ormoluPath], { silent: true });

  // Glob for the files to format.

  const globber = await glob.create(inputPattern, { followSymbolicLinks });
  const files = await globber.glob();

  const extraArgs = inputExtraArgs ? inputExtraArgs.split(' ') : [];
  const cabalArgs = respectCabalFiles ? [] : ['--no-cabal'];

  await exec.exec(ormoluPath, ['--version']);

  if (files.length === 0) {
    core.warning('The glob patterns did not match any source files');
    return;
  }

  const args = ['--color', 'always', '--check-idempotence', '--mode', mode]
    .concat(cabalArgs)
    .concat(extraArgs)
    .concat(files);

  await exec.exec(ormoluPath, args);
}

run().catch(() => {
  core.setFailed('Ormolu detected unformatted files');
});
