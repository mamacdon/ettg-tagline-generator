"use strict";
module.exports.words = words;

function words(s) {
    return s.split(/\s+/);
}

module.exports.first = function(s) {
    const w = words(s);
    return w[0];
}

module.exports.last = function(s) {
    const w = words(s);
    return w[w.length - 1];
}

const shortWords = /^(of|the|to|in|and|for)$/;
module.exports.titleCase = function(str) {
    const result = [], words = str.split(/\s+/);
    for (let i=0; i < words.length; i++) {
        const word = words[i];
        if (word === "") {
            continue;
        }
        const isFirst = i === 0;
        const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
        if (isFirst) {
            result.push(capitalized);
        } else {
            result.push(" " + (shortWords.test(word) ? word : capitalized));
        }
    }
    return result.join("");
}

// Fix dangling preposition or article
module.exports.cleanGrammar = function(words) {
    while (/^[.…]?(?:and|a|an|of|or|the|to)[.…]?$/i.test(words[words.length - 1])) {
        words.pop();
    }
    return words;
}