const packageJson = require("./package.json");
const version = packageJson.version;
const date = new Date();
const builder = process.env.BUILD_TAG;

const res = {
    version: version,
    date: date,
    builder: builder
};

const fs = require('fs');
const stream = fs.createWriteStream("./build/build_info.json");
stream.once('open', function(fd) {
    stream.write(JSON.stringify(res));
});

