/*eslint-env node*/
/*eslint strict:0*/
var fs = require("fs"),
    nodePath = require("path"),
    packageJson = require("../package.json");

var TOPICS_TXT = nodePath.join(__dirname, "../", packageJson.topics);

module.exports = function() {
    return fs.readFileSync(TOPICS_TXT, "utf8")
        .split(/\r?\n/)
        .filter(RegExp.prototype.test.bind(/\S/));
};
