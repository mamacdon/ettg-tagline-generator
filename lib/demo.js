const fs = require("fs");
const nodePath = require("path");
const Markov = require("markov");
const titleFiles = [/*"real_titles.txt",*/ "generated_titles.txt"].map(f => nodePath.join(__dirname, "../corpus/", f))

const titles = titleFiles.reduce((acc, path) => {
    acc = acc.concat(fs.readFileSync(path, "utf-8").split(/\r?\n/));
    return acc;
}, []);

// Create and seed generator
// TODO higher order for sequels?
const order = 2;
const markov = Markov(order);
titles.forEach(title => {
    if (title === "" || title[0] === "#" || /^\s+$/.test(title)) {
        return;
    }
    const replaced = title //.replace(/\b(a|of|the|to|in)\b/ig, "")
    markov.seed(replaced);
})

// Generate
const limit = 2;
for (var i = 0; i < 10; i++) {
    const key = markov.pick();

    // TODO fowrad only?
    const chain = markov.fill(key, limit); // this is lousy
    //const chain = markov.forward(key, limit); 
    debugger;

    const title = chain.join(" ").trim();
    // Ignore sequel only
    if (/^\d+:/.test(title)) {
        i--; // skip
        continue;
    }
    console.log("key: %s, title: %s", key, title)
};


// all this does is read stream linewise and call seed for each line.. i think
// const start = Date.now();
// markov.seed(stream, function() {
//     console.log("Finished seeding chain (took %dms).", (Date.now() - start));

//     const key = markov.pick();
//     const chain = markov.fill(key, this.limit);
//     console.log(chain.join(" "))
// });
