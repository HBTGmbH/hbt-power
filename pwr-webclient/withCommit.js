// Runs the given command with REACT_APP_COMMIT set to the checked-out commit (#247), from the same git log as
// build_info.json (compileBuildInfo.js): the bundle knows its own commit and can tell when a newer one is served.
const {spawnSync} = require('child_process');
const {commit} = require('./compileBuildInfo');

const [command, ...args] = process.argv.slice(2);
const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env: {...process.env, REACT_APP_COMMIT: commit().commit},
});
process.exit(result.status === null ? 1 : result.status);
