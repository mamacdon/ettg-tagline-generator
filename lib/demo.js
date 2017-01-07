const Markov = require("markov");
const corpusFile = require("path").join(__dirname, "../corpus/titles.txt");

const order = 5;
const markov = createMarkov(order);

const stream = fs.createReadStream(corpusFile);

// all this does is read stream linewise and call seed for each line.. i think
markov.seed(stream, function() {
    console.log("Finished seeding chain (took %d seconds).", (new Date().valueOf() - start) / 1000.0);

    const key = markov.pick(),
    const chain = markov.fill(key, this.limit);
    console.log(chain.join(" "))
});
