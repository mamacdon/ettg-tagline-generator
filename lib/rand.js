const Chance = require("chance");
const chance = new Chance();

module.exports.randIndex = function(array) {
    return chance.integer({ min: 0, max: array.length - 1 });
}