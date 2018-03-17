"use strict";
/*eslint-disable no-console*/
const Generator = require("./gen")

const gen = new Generator();

const upper = process.argv.slice(2).includes('-u');

for (var i = 0; i < 20; i++) {
    let str = gen.string();
    if (upper) {
        str = str.toUpperCase();
    }
    console.log("* " + str);
}
