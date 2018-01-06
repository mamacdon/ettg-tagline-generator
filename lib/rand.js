"use strict";
const Chance = require("chance");
const chance = new Chance();

module.exports.randIndex = randIndex;
module.exports.randInt = randInt;

module.exports.pick = function(array) {
    return array[randIndex(array)];
}

function randIndex(array) {
    return chance.integer({ min: 0, max: array.length - 1 });
}

// inclusive
function randInt(min, max) {
    return chance.integer({ min: min, max: max});
}