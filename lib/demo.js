const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const randIndex = require("./rand").randIndex;
const words = require("./words");
const titleCase = words.titleCase;
const lastWord = words.last;

const titleFiles = ["real_titles.txt", "generated_titles.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))
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
const limit = 2;
for (var i = 0; i < 20; i++) {
    // Try picking a word from generated_titles as the key then respond
    // TODO: start with a good title beginning - ie first word of something from GeneratedTitles

    // const title = get1();
    const title = get2();
    console.log(title.join(" "));
};

function get1() {
    const randomTitle = titles[randIndex(titles)];
    const topic = lastWord(randomTitle);

    return markov.respond(topic, limit);
}

function get2() {
    const key = markov.pick();
    return markov.fill(key, limit);
}