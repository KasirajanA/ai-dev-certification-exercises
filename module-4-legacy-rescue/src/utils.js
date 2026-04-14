'use strict'

// utils.js — helper functions

const fs = require('fs')

async function readFileContent(path) {
  return fs.promises.readFile(path, 'utf8')
}

function countWords(text) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0)
  const counts = {}
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (counts[w]) {
      counts[w] = counts[w] + 1
    } else {
      counts[w] = 1
    }
  }
  return counts
}

function sortByCount(wordCounts) {
  const entries = []
  for (const word in wordCounts) {
    entries.push([word, wordCounts[word]])
  }
  entries.sort((a, b) => b[1] - a[1])
  return entries
}

function formatResults(sorted, limit) {
  let result = ''
  const max = limit || 10
  for (let i = 0; i < Math.min(sorted.length, max); i++) {
    result = result + (i + 1) + '. ' + sorted[i][0] + ' (' + sorted[i][1] + ')\n'
  }
  return result
}

module.exports = {
  readFileContent,
  countWords,
  sortByCount,
  formatResults,
}
