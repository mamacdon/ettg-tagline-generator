/*eslint no-process-exit:0*/
var child_process = require("child_process"),
    events = require("events"),
    nodePath = require("path"),
    nodeUtil = require("util"),
    Q = require("q");
var logger = require("./logger");
var EventEmitter = events.EventEmitter;

// **************************************************************************
// Helpers
// **************************************************************************
function shittyClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// **************************************************************************
// Classes
// **************************************************************************
/**
 * Creates the child worker process and manages communication with it.
 * @inherits {events.EventEmitter}
 *
 * Emits events:
 * - "error"
 */
function Manager(topics, corpusFile, order, limit) {
    this.topics = topics;
    this.corpus = corpusFile;
    this.order = order;
    this.limit = limit;
    this.started = false;
    this.worker = null;
}
nodeUtil.inherits(Manager, EventEmitter);
/**
 * @returns {Promise} A promise that resolves when we're ready to generate shit.
 */
Manager.prototype.start = function() {
    if (this.started) {
        throw new Error("Already started");
    }

    this.started = true;
    this.pendingResponses = []; // {Q.Deferred[]} FIFO queue
    this.worker = this.forkIt();
    return this.attach(this.worker);
};
/** @returns {ChildProcess} */
Manager.prototype.forkIt = function() {
    // Provide params to the markov worker in its env.
    var env = shittyClone(process.env);
    env.ORDER       = this.order;
    env.LIMIT       = this.limit;
    env.TOPICS      = JSON.stringify(this.topics);
    env.CORPUS_FILE = this.corpus;
    return child_process.fork(nodePath.join(__dirname, "markov-worker.js"), {
        env: env
    });
};
/** @returns {Promise} */
Manager.prototype.attach = function(worker) {
    var deferred = Q.defer();
    var _self = this;
    worker.on("message", function(event) {
        switch (event.type) {
            case "ready":
                deferred.resolve();
                return;
            case "response":
                logger.debug("Got response:", event);
                var d = _self.pendingResponses.shift();
                if (!d) {
                    logger.error("Received message but no pendingResponses found");
                    return;
                }
                d.resolve(event.data.chain);
                return;
        }
    });
    worker.on("error", this.emit.bind(this, "error"));
    // TODO Is this really necessary?
    process.once("SIGTERM", function() {
        worker.kill("SIGTERM");
        process.exit(0);
    });
    return deferred.promise;
};
Manager.prototype.checkStarted = function() {
    if (!this.started) {
        throw new Error("Not started");
    }
};
Manager.prototype._send  = function(event) {
    this.checkStarted();
    logger.debug("send: ", event);
    this.worker.send(event);
    var d = Q.defer();
    this.pendingResponses.unshift(d);
    return d.promise;
};
/** @returns {Promise} */
Manager.prototype.random = function() {
    return this._send({
        type: "random"
    });
};
/** @returns {Promise} */
Manager.prototype.reply = function(to) {
    return this._send({
        type: "reply",
        topic: to
    });
};

module.exports = Manager;
