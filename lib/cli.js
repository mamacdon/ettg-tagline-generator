"use strict";
/*eslint-disable no-console*/
const Generator = require("./gen")

const gen = new Generator();

for (var i = 0; i < 20; i++) {
    console.log("* " + gen.string());
}
