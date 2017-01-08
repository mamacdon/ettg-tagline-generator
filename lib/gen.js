const crypto = require("crypto");
const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const randIndex = require("./rand").randIndex;
const words = require("./words");

const corpusFiles = ["taglines.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))
const corpusLines = corpusFiles.reduce((acc, path) => {
    acc = acc.concat(fs.readFileSync(path, "utf-8").split(/\r?\n/));
    return acc;
}, []);
const corpusHash = new Set(corpusLines.map(l => md5(l)));

module.exports = generate;

let markov = null;

function createMarkov() {
    // Create and seed generator
    const order = 2;
    const markov = Markov(order);
    corpusLines.forEach(title => {
        if (title === "" || title[0] === "#" || /^\s+$/.test(title)) {
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
    let array = null;
    let result;
    while (!array) {
        array = get1(limit);
        if (!array) {
            continue;
        }
        result = words.sentenceCase(array.join(" "));
        if (corpusHash.has(md5(result))) {
            // don't regurgitate the input, make sure it's different
            continue;
        }
    }
    return result + (/[^!?.\u2026]/.test(result[result.length - 1]) ? "." : "" );
}

// Experimenting with some different strategies
function get1(limit) {
    return markov.fill(markov.pick(), limit);
}

function get2(limit) {
    const randomTitle = corpusLines[randIndex(corpusLines)];
    const topic = words.lastWord(randomTitle);
    return markov.respond(topic, limit);
}

function get3(limit) {
    const randomTitle = corpusLines[randIndex(corpusLines)];
    const key = markov.search(lastWord(randomTitle));
    if (!key) {
        return null;
    }
    return markov.fill(key, limit);
}

function md5(s) {
    return crypto.createHash("md5").update(s).digest("hex");
}