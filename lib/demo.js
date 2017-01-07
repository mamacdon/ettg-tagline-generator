const fs = require("fs");
const Markov = require("markov");
const corpusFile = require("path").join(__dirname, "../corpus/titles.txt");

// TODO order 2 for regular titles
// higher order for sequels?
const order = 2;
const markov = Markov(order);

const stream = fs.createReadStream(corpusFile);
const titles = fs.readFileSync(corpusFile, "utf-8").split(/\r?\n/)

// all this does is read stream linewise and call seed for each line.. i think
const start = Date.now();
titles.forEach(title => {
    if (title === "" || title[0] === "#" || /^\s+$/.test(title)) {
        return;
    }
    const replaced = title.replace(/\b(a|of|the|to)\b/, "")
    markov.seed(replaced);
})

const limit = 10;
for (var i = 0; i < 10; i++) {
    const key = markov.pick();
    const chain = markov.fill(key, 2); // ?
    console.log(chain.join(" "))
};



// all this does is read stream linewise and call seed for each line.. i think
// markov.seed(stream, function() {
//     console.log("Finished seeding chain (took %dms).", (Date.now() - start));

//     const key = markov.pick();
//     const chain = markov.fill(key, this.limit);
//     console.log(chain.join(" "))
// });
