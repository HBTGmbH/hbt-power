let fs = require('fs');
let packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

let version = packageJson.version.split(".");
let majorVersion = Number.parseInt(version[0]);
let minorVersion = Number.parseInt(version[1]);
let incrementalVersion = Number.parseInt(version[2]);

let newVersion = majorVersion + "." + minorVersion + "." + (incrementalVersion + 1) + "-SNAPSHOT";
packageJson.version = newVersion;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, 2, 2), 'utf8');
