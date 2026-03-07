// analyzer.js — analyzes text files for word frequency
// written 2019, never updated, no error handling worth mentioning

var utils = require('./utils')

function analyzeFile(filepath, callback) {
  utils.readFileContent(filepath, function(err, content) {
    if (err) {
      callback(err)
      return
    }
    var words = utils.countWords(content)
    var sorted = utils.sortByCount(words)
    var stats = {
      totalWords: 0,
      uniqueWords: Object.keys(words).length,
      topWords: sorted.slice(0, 10),
      filepath: filepath
    }
    // count total words (yes this is redundant, legacy code...)
    for (var word in words) {
      stats.totalWords = stats.totalWords + words[word]
    }
    callback(null, stats)
  })
}

function analyzeMultiple(filepaths, callback) {
  var results = []
  var completed = 0
  var hasError = false

  if (filepaths.length === 0) {
    callback(null, [])
    return
  }

  for (var i = 0; i < filepaths.length; i++) {
    ;(function(index) {
      analyzeFile(filepaths[index], function(err, stats) {
        if (hasError) return
        if (err) {
          hasError = true
          callback(err)
          return
        }
        results[index] = stats
        completed++
        if (completed === filepaths.length) {
          callback(null, results)
        }
      })
    })(i)
  }
}

module.exports = {
  analyzeFile: analyzeFile,
  analyzeMultiple: analyzeMultiple
}
