/*eslint-env node*/
/*eslint no-multi-spaces:0 strict:0*/
/**
 * Turns a markov instance into a chatbot
 */

/**
 * @param {object[]} arr
 * @returns {object}
 */
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {string[]} chain
 * @returns {string}
 */
function toText(chain) {
    return chain.join(" ");
}

/**
 * @param {Markov}   options.markov
 * @param {string[]} topics
 * @param {number}   [options.limit]
 */
function Bot(options) {
    this.markov = options.markov;
    this.limit  = options.limit || undefined;
    this.topics = options.topics;
    if (!this.topics || !this.markov) {
        throw new Error("Missing param");
    }
}
Bot.prototype.randomTopic = function() {
    return randomItem(this.topics);
};
Bot.prototype.random = function() {
    var markov = this.markov,
         key = markov.pick(),
         chain = markov.fill(key, this.limit);
    return {
        key: key,
        chain: Array.prototype.toString.call(chain),
        text: toText(chain)
    };
};
/**
 * @param {string} what
 */
Bot.prototype.reply = function(what) {
    what = what || this.randomTopic();
    var markov = this.markov,
        chain = markov.respond(what, this.limit);
    return {
        topic: what,
        chain: Array.prototype.toString.call(chain),
        text: toText(chain)
    };
};

module.exports = Bot;
