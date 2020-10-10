const core = require('@actions/core');
const github = require('@actions/github');

// https://github.com/actions/toolkit

// 1. download ormolu executable using @actions/tool-cache perhaps
// https://github.com/tweag/ormolu/releases/download/0.1.3.0/ormolu-Linux
// https://github.com/tweag/ormolu/releases/download/0.1.3.0/ormolu-macOS
// https://github.com/tweag/ormolu/releases/download/0.1.3.0/ormolu-Windows

// 2. grep Haskell files and run ormolu

// 3. call git to highlight diffs

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
