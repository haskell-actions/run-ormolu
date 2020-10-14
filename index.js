import * as path from 'path';

const core = require('@actions/core');
const github = require('@actions/github');
const tool_cache = require('@actions/tool-cache');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const ormolu_version = '0.1.4.1';
const ormolu_linux_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-Linux';
const ormolu_windows_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-Windows';
const ormolu_macos_url = 'https://github.com/tweag/ormolu/releases/download/' + ormolu_version + '/ormolu-macOS';

const input_pattern = core.getInput('pattern');
const input_follow_symbolic_links = core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE';
const input_extra_args = core.getInput('extra-args');

async function run() {
  try {

    // Download ormolu executable

    var ormolu_path;

    if (process.platform === 'win32') {
        ormolu_path = await tool_cache.downloadTool(ormolu_windows_url);
    }
    else if (process.platform === 'darwin') {
        ormolu_path = await tool_cache.downloadTool(ormolu_macos_url);
    }
    else {
        ormolu_path = await tool_cache.downloadTool(ormolu_linux_url);
    }

    // Cache ormolu executable

    const ormolu_cached_dir = await tool_cache.cacheFile(
        ormolu_path,
        'ormolu',
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

    // Run ormolu

    await exec.exec(ormolu_cached_path, ['--version']);
    await exec.exec(
        ormolu_cached_path,
        ['--color', 'always', '--check-idempotence', '--mode', 'check'].concat(files)
    );

  } catch (error) {
    core.setFailed("Ormolu detected unformatted files");
  }
}

run();
