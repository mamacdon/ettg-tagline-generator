/*eslint-env node*/
/*eslint no-mixed-requires:0 strict:0*/
var fs = require("fs"),
    nodePath = require("path"),
    readline = require("readline"),
    util = require("util"),
    Q = require("q");

var Manager = require("./manager"),
    logger = require("./logger"),
    topics = require("./topics")();

var markovOrder = process.env.MARKOV_ORDER || 2,
    markovLimit = process.env.MARKOV_LIMIT || 25,
    PROMPT = "r: random, t: tweet, <topic>: reply";
var corpusTxt = nodePath.resolve(__dirname, "../", require("../package.json").corpus);

function handleLine(manager, rl, line) {
    var replied;
    switch(line.trim()) {
        case "":
            replied = Q.resolve();
            break;
        case "r":
            replied = manager.random().then(function(result) {
                logger.debug(result);
                logger.log("key: %s", result.key);
                logger.log(result.text);
            });
            break;
        case "t":
            // `null` blows but it's the API
            replied = manager.reply(null).then(function(result) {
                logger.log("topic: %s", result.topic);
                logger.log(result.text);
            });
            break;
        default:
            // Tweet or Reply mode
            var topic = line;
            replied = manager.reply(topic).then(function(result) {
                logger.log("topic: %s", result.topic);
                logger.log(result.text);
            });
    }
    replied.then(function() {
        logger.log(PROMPT);
        rl.prompt();
    }).catch(function(error) {
        logger.error(error);
    });
}

// **************************************************************************
// Start
// **************************************************************************
if (!fs.existsSync(corpusTxt)) {
    throw new Error(util.format("Corpus file not found: %s. Try running `npm install .`.", corpusTxt));
}

logger.log("Topics: %s\n", topics.join(", "));
logger.log("Initializing...");

var start = new Date().valueOf();
var mgr = new Manager(topics, corpusTxt, markovOrder, markovLimit);
mgr.on("error", logger.error.bind(logger));
mgr.start().then(function() {
    logger.log("Ready to chat bro (took %d seconds).", (new Date().valueOf() - start) / 1000.0);

    var rl = readline.createInterface(process.stdin, process.stdout);
    logger.log(PROMPT);
    rl.setPrompt("> ");
    rl.prompt();
    rl.on("line", handleLine.bind(null, mgr, rl))
    .on("close", process.exit.bind(process, 0));
});
