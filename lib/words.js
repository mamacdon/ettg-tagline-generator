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

module.exports.titleCase = function(str) {
    var result = [], words = str.split(/\s+/);
    for (var i=0; i < words.length; i++) {
        var word = words[i];
        if (word === "") {
            continue;
        }
        var isFirst = i === 0,
            isShort = /^(of|the|to|in|and|for)$/.test(word),
            capitalized = word.substr(0,1).toUpperCase() + word.substr(1);
        if (isFirst) {
            result.push(capitalized);
        } else {
            result.push(" " + (isShort ? word : capitalized));
        }
    }
    return result.join("");
}

// Fix a few obvious nonsense things
module.exports.cleanGrammar = function(words) {
    while (/the|of|and/i.test(words[words.length - 1])) {
        words.pop();
    }
    return words;
}