import * as path from 'path';

const core = require('@actions/core');
const github = require('@actions/github');
const tool_cache = require('@actions/tool-cache');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const input_version = core.getInput('version');
const ormolu_version = input_version === 'latest' ? '0.8.0.0' : input_version;
const ormolu_linux_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-x86_64-linux.zip';
const ormolu_windows_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-x86_64-windows.zip';
const ormolu_darwin_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-aarch64-darwin.zip';

const input_pattern = core.getInput('pattern');
const input_respect_cabal_files = core.getInput('respect-cabal-files').toUpperCase() !== 'FALSE';
const input_follow_symbolic_links = core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE';
const input_mode = core.getInput('mode').toLowerCase();
const input_extra_args = core.getInput('extra-args');

async function run() {
  try {

    // Download ormolu archive

    var ormolu_archive;

    if (process.platform === 'win32') {
        ormolu_archive = await tool_cache.downloadTool(ormolu_windows_url);
    }
    else if (process.platform === 'darwin') {
        ormolu_archive = await tool_cache.downloadTool(ormolu_darwin_url);
    }
    else {
        ormolu_archive = await tool_cache.downloadTool(ormolu_linux_url);
    }

    // Unpack the archive

    const ormolu_extracted_dir = process.env['RUNNER_TEMP'];
    await tool_cache.extractZip(ormolu_archive, ormolu_extracted_dir);
    // const ormolu_extracted_path = path.join(ormolu_extracted_dir, 'ormolu');

    // Cache ormolu executable

    const ormolu_cached_dir = await tool_cache.cacheDir(
        ormolu_extracted_dir,
        'ormolu',
        ormolu_version
    );
    const ormolu_cached_path = path.join(ormolu_cached_dir, 'ormolu');

    // Set mode

    await exec.exec('chmod', ['+x', ormolu_cached_path], {silent: true});

    // Glob for the files to format

    const globber = await glob.create(
        input_pattern,
        {
            followSymbolicLinks: input_follow_symbolic_links
        }
    );
    const files = await globber.glob();

    // Extra args

    var extra_args = [];

    if (input_extra_args) {
        extra_args = input_extra_args.split(' ');
    }

    // Respect Cabal files

    var respect_cabal_files = [];

    if (!(input_respect_cabal_files)) {
        respect_cabal_files = ['--no-cabal'];
    }

    // Run ormolu

    await exec.exec(ormolu_cached_path, ['--version']);

    if (files.length > 0) {
        await exec.exec(
            ormolu_cached_path,
            ['--color', 'always', '--check-idempotence', '--mode', input_mode]
                .concat(respect_cabal_files)
                .concat(extra_args)
                .concat(files)
        );
    }
    else {
        core.warning("The glob patterns did not match any source files");
    }

  } catch (error) {
    core.setFailed("Ormolu detected unformatted files");
  }
}

run();
