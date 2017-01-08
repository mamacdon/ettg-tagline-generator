const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const randIndex = require("./rand").randIndex;
const words = require("./words");

const titleFiles = ["taglines.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))
const titles = titleFiles.reduce((acc, path) => {
    acc = acc.concat(fs.readFileSync(path, "utf-8").split(/\r?\n/));
    return acc;
}, []);

// Create and seed generator
const order = 2;
const markov = Markov(order);
titles.forEach(title => {
    if (title === "" || title[0] === "#" || /^\s+$/.test(title)) {
        return;
    }
    markov.seed(title);
})

// Generate
const limit = 8;
for (var i = 0; i < 20; i++) {
    const array = get1();
    if (!array) {
        i--;
        continue;
    }
    const title = words.sentenceCase(array.join(" "));
    if (titles.indexOf(title) >= 0) {
        // console.log("ignore " + title)
        i--;
        continue;
    }
    console.log(title + (/[^.\u2026]/.test(title[title.length]) ? "." : "" ))
}

function get1() {
    return markov.fill(markov.pick(), limit);
}

function get2() {
    const randomTitle = titles[randIndex(titles)];
    const topic = words.lastWord(randomTitle);
    return markov.respond(topic, limit);
}

function get3() {
    const randomTitle = titles[randIndex(titles)];
    const key = markov.search(lastWord(randomTitle));
    if (!key) {
        return null;
    }
    return markov.fill(key, limit);
}