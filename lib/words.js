function words(s) {
    return s.split(/\s+/);
}

module.exports.words = words;

module.exports.sentenceCase = function(s) {
    return s;
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
