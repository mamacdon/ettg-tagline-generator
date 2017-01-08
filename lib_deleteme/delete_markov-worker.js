/*eslint-env node*/
/**
 * Creates a Markov worker process.
 *
 * Required environment variables:
 *   ORDER          Order of the Markov chain.
 *   LIMIT          Limit to fill the Markov chain.
 *   TOPICS         JSON array of topics.
 *   CORPUS_FILE    Path to the file to seed from.
 *
 * Receives messages:
 * - { type: "random", seq: number, }
 *     Pick a result at random.
 * - { type: "reply",  seq: number, topic: string }
 *     Reply to the given text.
 *
 * Emits messages:
 * - { type: "ready" }
 *     When the Markov generator has been completely seeded.
 * - { type: "response", seq: number, chain: string[] }
 *     In response to a "random" or "reply" message.
 *
 */
var createMarkov = require("markov"),
    fs = require("fs"),
    Q = require("q"),
    Bot = require("./bot"),
    logger = require("./logger");

// **************************************************************************************
// Helpers
// **************************************************************************************

function log() {
    var s = arguments[0];
    if (typeof s !== "string") {
        logger.log.apply(logger, arguments);
    } else {
        var rest = Array.prototype.slice.call(arguments, 1);
        return logger.log.apply(logger, ["Worker: " + s].concat(rest));
    }
}

function array(val) {
    try {
        var a = JSON.parse(val);
        if (Array.isArray(a)) {
            return a;
        }
    } catch (e) {}
    return null;
}

function num(val) {
    var n = Number(val);
    return isNaN(n) ? null : n;
}

function postMessage(type, data) {
    data = data === undefined ? null : data;
    process.send({ type: type, data: data });
}

// **************************************************************************************
// Classes
// **************************************************************************************
function Worker(order, limit, topics, corpus) {
    if (!order || !limit || !topics || !corpus) {
        throw new Error("Missing param. Got: " + Array.prototype.slice.call(arguments).join(", "));
    }
    this.order  = order;
    this.limit  = limit;
    this.topics = topics;
    this.corpus = corpus;
    this.markov = createMarkov(this.order);
    this.bot = null;
}
Worker.prototype.createBot = function() {
    var d = Q.defer(),
        start = new Date().valueOf(),
        markov = this.markov,
        self = this;
    markov.seed(fs.createReadStream(this.corpus), function() {
        log("Finished seeding chain (took %d seconds).", (new Date().valueOf() - start) / 1000.0);
        self.bot = new Bot({
            markov: markov,
            limit: self.limit,
            topics: self.topics
        });
        d.resolve();
    });
    return d.promise;
};
Worker.prototype.start = function() {
    var self = this;
    this.createBot().then(function() {
        self.listen();
        postMessage("ready");
    });
};
Worker.prototype.listen = function() {
    var self = this;
    process.on("message", function(event) {
        var seq = event.seq;
        switch (event.type) {
            case "random":
                postMessage("response", { seq: seq, chain: self.bot.random() });
                break;
            case "reply":
                postMessage("response", { seq: seq, chain: self.bot.reply(event.topic) });
                break;
        }
    });
};

// **************************************************************************************
// Start
// **************************************************************************************
new Worker(
    num(process.env.ORDER),
    num(process.env.LIMIT),
    array(process.env.TOPICS),
    process.env.CORPUS_FILE
).start();
