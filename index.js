const core = require('@actions/core');
const github = require('@actions/github');
const tool_cache = require('@actions/tool-cache');
const exec = require('@actions/exec');
const glob = require('@actions/glob');

const ormolu_linux_url = 'https://github.com/tweag/ormolu/releases/download/0.1.3.0/ormolu-Linux';
const ormolu_windows_url = 'https://github.com/tweag/ormolu/releases/download/0.1.3.0/ormolu-Windows';
const ormolu_macos_url = 'https://github.com/tweag/ormolu/releases/download/0.1.3.0/ormolu-macOS';
const ormolu_version = '0.1.3.0';

const input_pattern = core.getInput('pattern');
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

    const ormolu_cached_path = await tool_cache.cacheFile(ormolu_path, 'ormolu', 'ormolu', ormolu_version);

    // Add ormolu to PATH

    core.addPath(ormolu_cached_path);

    // Glob for the files to format

    const globber = await glob.create(input_pattern);
    const files = await globber.glob();

    // // TODO grep Haskell files and run ormolu

    // // TODO call git to highlight diffs

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
