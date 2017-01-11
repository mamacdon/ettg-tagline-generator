/*eslint-disable no-constant-condition*/
const crypto = require("crypto");
const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const pick = require("./rand").pick;
const words = require("./words");

const punctuation = /[^!?.\u2026]/;

const corpusFiles = ["taglines.txt", "taglines_auto.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))
const corpusLines = corpusFiles.reduce((acc, path) => {
    acc = acc.concat(fs.readFileSync(path, "utf-8").split(/\r?\n/));
    return acc;
}, []);
const corpusHash = new Set(corpusLines.map(hash));

module.exports = Generator;

function Generator(options) {
    options = options || {};

    // Create and seed generator
    const order = options.order || 2;
    this.markov = Markov(order);
    corpusLines.forEach(title => {
        if (title === "" || title[0] === "#") {
            return;
        }
        this.markov.seed(title);
    });

    this.genFn = get3.bind(null, this.markov);
}

Generator.prototype.string = function(options) {
    options = options || {};

    const limit = options.limit || 12;
    let result;
    while (true) {
        const array = this.genFn(limit);
        if (!array) {
            continue;
        }
        result = array.join(" ");
        if (corpusHash.has(hash(result))) {
            // don't regurgitate the input, make sure it's different
            continue;
        }
        break;
    }

    return result + (punctuation.test(result[result.length - 1]) ? "." : ""); 
};

function hash(s) {
    const mangled = s.toLowerCase().replace(/[^a-z]+/g, "");
    return crypto.createHash("md5").update(mangled).digest("hex");
}

// Below are different strategies i'm trying out

// yoda esque
function get1(markov, limit) {
    return markov.fill(markov.pick(), limit);
}

// also yoda
function get2(markov, limit) {
    const randomTitle = pick(corpusLines);
    const topic = words.last(randomTitle);
    return markov.respond(topic, limit);
}

// This is the best so far
function get3(markov, limit) {
    const randomTitle = pick(corpusLines);
    const key = markov.search(words.last(randomTitle));
    if (!key) {
        return null;
    }
    return markov.fill(key, limit);
}

// Too jumbled
function get4(markov, limit) {
    const randomTitle = pick(corpusLines);
    const key = markov.search(words.last(randomTitle));
    if (!key) {
        return null;
    }
    return markov.backward(key, limit);
}

// function get5(markov, limit) {
//     const randomTitle = corpusLines[randIndex(corpusLines)];
//     const topic = pick(randomTitle.split(/\s/))
//     const key = markov.search(topic);
//     if (!key) {
//         return null;
//     }
//     return [topic].concat(markov.forward(key, limit));
// }
