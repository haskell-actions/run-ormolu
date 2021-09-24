import * as path from 'path';

const core = require('@actions/core');
const github = require('@actions/github');
const tool_cache = require('@actions/tool-cache');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const ormolu_version = '0.3.0.1';
const ormolu_linux_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-Linux.zip';
const ormolu_windows_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-Windows.zip';
const ormolu_macos_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-macOS.zip';

const input_pattern = core.getInput('pattern');
const input_respect_cabal_files = core.getInput('respect-cabal-files').toUpperCase() !== 'FALSE';
const input_follow_symbolic_links = core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE';
const input_extra_args = core.getInput('extra-args');

async function run() {
  try {

    // Download ormolu archive

    var ormolu_archive;

    if (process.platform === 'win32') {
        ormolu_archive = await tool_cache.downloadTool(ormolu_windows_url);
    }
    else if (process.platform === 'darwin') {
        ormolu_archive = await tool_cache.downloadTool(ormolu_macos_url);
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

    exec.exec('chmod', ['+x', ormolu_cached_path], {silent: true});

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

    if (input_respect_cabal_files) {
        respect_cabal_files = ['--cabal-default-extensions'];
    }

    // Run ormolu

    await exec.exec(ormolu_cached_path, ['--version']);

    if (files.length > 0) {
        await exec.exec(
            ormolu_cached_path,
            ['--color', 'always', '--check-idempotence', '--mode', 'check']
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
