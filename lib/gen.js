/*eslint-disable no-constant-condition*/
const crypto = require("crypto");
const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const pick = require("./rand").pick;
const words = require("./words");

const corpusFiles = ["taglines.txt", "taglines_auto.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))
const corpusLines = corpusFiles.reduce((acc, path) => {
    acc = acc.concat(fs.readFileSync(path, "utf-8").split(/\r?\n/));
    return acc;
}, []);
const corpusHash = new Set(corpusLines.map(hash));

module.exports = generate;

let markov = null;

function createMarkov() {
    // Create and seed generator
    const order = 2;
    const markov = Markov(order);
    corpusLines.forEach(title => {
        if (title === "" || title[0] === "#") {
            return;
        }
        markov.seed(title);
    })
    return markov;
}

function generate() {
    if (!markov) {
        markov = createMarkov()
    }

    const limit = 8;
    let result;
    while (true) {
        // get3 seems to work well
        const array = get3(limit);
        if (!array){
            continue;
        }

        result = array.join(" ");

        if (corpusHash.has(hash(result))) {
            // don't regurgitate the input, make sure it's different
            continue;
        }
        break;
    }

    return result + (/[^!?.\u2026]/.test(result[result.length - 1]) ? "." : "" );
}

// Experimenting with some different strategies
function get1(limit) {
    return markov.fill(markov.pick(), limit);
}

// function get2(limit) {
//     const randomTitle = pick(corpusLines);
//     const topic = words.last(randomTitle);
//     return markov.respond(topic, limit);
// }

function get3(limit) {
    const randomTitle = pick(corpusLines);
    const key = markov.search(words.last(randomTitle));
    if (!key) {
        return null;
    }
    return markov.fill(key, limit);
}

function get4(limit) {
    const randomTitle = pick(corpusLines);
    const key = markov.search(words.last(randomTitle));
    if (!key) {
        return null;
    }
    return markov.backward(key, limit);
}

// function get5(limit) {
//     const randomTitle = corpusLines[randIndex(corpusLines)];
//     const topic = pick(randomTitle.split(/\s/))
//     const key = markov.search(topic);
//     if (!key) {
//         return null;
//     }
//     return [topic].concat(markov.forward(key, limit));
// }

function hash(s) {
    const mangled = s.toLowerCase().replace(/[^a-z]+/g, "");
    return crypto.createHash("md5").update(mangled).digest("hex");
}