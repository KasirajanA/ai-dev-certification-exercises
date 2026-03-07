// utils.js — helper functions (no docs, inconsistent style, var everywhere)

var fs = require('fs')

function readFileContent(path, cb) {
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) cb(err)
    else cb(null, data)
  })
}

function countWords(text) {
  var words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function(w) { return w.length > 0 })
  var counts = {}
  for (var i = 0; i < words.length; i++) {
    var w = words[i]
    if (counts[w]) {
      counts[w] = counts[w] + 1
    } else {
      counts[w] = 1
    }
  }
  return counts
}

function sortByCount(wordCounts) {
  var entries = []
  for (var word in wordCounts) {
    entries.push([word, wordCounts[word]])
  }
  entries.sort(function(a, b) { return b[1] - a[1] })
  return entries
}

function formatResults(sorted, limit) {
  var result = ''
  var max = limit || 10
  for (var i = 0; i < Math.min(sorted.length, max); i++) {
    result = result + (i + 1) + '. ' + sorted[i][0] + ' (' + sorted[i][1] + ')\n'
  }
  return result
}

module.exports = {
  readFileContent: readFileContent,
  countWords: countWords,
  sortByCount: sortByCount,
  formatResults: formatResults
}
