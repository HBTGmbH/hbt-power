// Writes build/build_info.json (version, build time, builder, commit). The CI publish job runs it after the build;
// in local dev mode src/setupProxy.js serves the same content as /build_info.json.
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

/** Hash and committer date (ISO) of the checked-out commit, empty without git */
function commit() {
    try {
        const [hash, time] = execSync('git log -1 --format=%H%n%cI', {cwd: __dirname, encoding: 'utf8'}).trim().split('\n');
        return {commit: hash, commitTime: time};
    } catch (e) {
        return {commit: '', commitTime: ''};
    }
}

function buildInfo() {
    return {
        version: packageJson.version,
        date: new Date(),
        builder: process.env.BUILD_TAG,
        ...commit(),
    };
}

module.exports = {buildInfo};

if (require.main === module) {
    fs.writeFileSync(path.join(__dirname, 'build', 'build_info.json'), JSON.stringify(buildInfo()));
}
