"use strict";
/*eslint-disable no-constant-condition*/
const crypto = require("crypto");
const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const pick = require("./rand").pick;
const randInt = require("./rand").randInt;
const words = require("./words");

const punctuation = /[^!?.\u2026]/;

const corpusFiles = ["taglines.txt", "taglines_auto.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))
const corpusLines = corpusFiles.reduce((acc, path) => {
    acc = acc.concat(fs.readFileSync(path, "utf-8").split(/\r?\n/)).filter(l => l !== "" && l[0] !== "#")
    return acc;
}, []);
const corpusHash = new Set(corpusLines.map(hash));

module.exports = Generator;

function Generator(options) {
    options = options || {};

    // Create and seed generator
    // Randomize the order. 1 gives more variation, 2 gives more coherence
    const order = options.order || pick([1, 1, 1, 2]);
    this.markov = Markov(order);
    corpusLines.forEach(title => this.markov.seed(title));

    // get3 is the best result for order==2, get6 does well with order==1
    const getter = (order === 1 ? get6 : get3);
    this.genFn = getter.bind(null, this.markov);
}

Generator.prototype.string = function(options) {
    options = options || {};

    // TODO choose limit from a common set of lengths instead?
    //const limit = options.limit || pick(limits);
    const limit = options.limit || randInt(5, 15);
    let result;
    while (true) {
        const array = this.genFn(limit);
        if (!array) {
            continue;
        }
        result = words.cleanGrammar(array).join(" ");
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

// Start from a known title-beginning word and fill it.
// This works OK with order == 1 but does poorly for > 1
const firstWords = new Set();
corpusLines.forEach(line => firstWords.add(words.first(line)))
const starters = Array.from(firstWords);
function get6(markov, limit) {
    const s = pick(starters);
    const key = markov.search(s);
    if (!key) {
        return null;
    }
    const rest = markov.forward(key, limit);
    // console.log(`key: ${key}`, limit, rest)
    const result = [words.titleCase(s), ...rest];
    if (result.length < 3) {
        return null; // discard
    }
    return result;
    //return words.titleCase([s].concat(rest)).join(" ").trim();
}
