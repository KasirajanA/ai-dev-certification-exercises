'use strict'

var utils = require('../utils')

// ---------------------------------------------------------------------------
// countWords
// ---------------------------------------------------------------------------
describe('countWords', function() {
  test('counts a single word', function() {
    expect(utils.countWords('hello')).toEqual({ hello: 1 })
  })

  test('counts multiple distinct words', function() {
    expect(utils.countWords('foo bar baz')).toEqual({ foo: 1, bar: 1, baz: 1 })
  })

  test('counts repeated words', function() {
    expect(utils.countWords('the cat and the dog')).toEqual({
      the: 2, cat: 1, and: 1, dog: 1
    })
  })

  test('lowercases all words — "Hello" and "hello" are the same word', function() {
    expect(utils.countWords('Hello HELLO hello')).toEqual({ hello: 3 })
  })

  test('strips punctuation characters', function() {
    var result = utils.countWords('hello, world! foo.')
    expect(result).toEqual({ hello: 1, world: 1, foo: 1 })
  })

  test('handles multiple spaces between words', function() {
    expect(utils.countWords('a   b    c')).toEqual({ a: 1, b: 1, c: 1 })
  })

  test('handles newlines and tabs as whitespace', function() {
    expect(utils.countWords('one\ntwo\tthree')).toEqual({ one: 1, two: 1, three: 1 })
  })

  test('returns empty object for empty string', function() {
    expect(utils.countWords('')).toEqual({})
  })

  test('returns empty object for whitespace-only input', function() {
    expect(utils.countWords('   \n\t  ')).toEqual({})
  })

  test('keeps alphanumeric tokens — numbers count as words', function() {
    var result = utils.countWords('node 42 version 42')
    expect(result).toEqual({ node: 1, 42: 2, version: 1 })
  })

  test('mixed alphanumeric token is kept as one word', function() {
    // "hello123" is kept intact because it matches [a-z0-9]
    expect(utils.countWords('hello123')).toEqual({ hello123: 1 })
  })
})

// ---------------------------------------------------------------------------
// sortByCount
// ---------------------------------------------------------------------------
describe('sortByCount', function() {
  test('returns an array of [word, count] pairs', function() {
    var result = utils.sortByCount({ cat: 2, dog: 5 })
    expect(Array.isArray(result)).toBe(true)
    result.forEach(function(entry) {
      expect(Array.isArray(entry)).toBe(true)
      expect(entry).toHaveLength(2)
    })
  })

  test('sorts descending by count', function() {
    var result = utils.sortByCount({ apple: 1, banana: 5, cherry: 3 })
    expect(result[0]).toEqual(['banana', 5])
    expect(result[1]).toEqual(['cherry', 3])
    expect(result[2]).toEqual(['apple', 1])
  })

  test('returns all entries, not just top-N', function() {
    var input = { a: 1, b: 2, c: 3, d: 4, e: 5 }
    expect(utils.sortByCount(input)).toHaveLength(5)
  })

  test('returns empty array for empty input', function() {
    expect(utils.sortByCount({})).toEqual([])
  })

  test('handles single entry', function() {
    expect(utils.sortByCount({ only: 7 })).toEqual([['only', 7]])
  })

  test('round-trips through countWords correctly', function() {
    var counts = utils.countWords('the cat and the cat and the')
    var sorted = utils.sortByCount(counts)
    expect(sorted[0]).toEqual(['the', 3])
    expect(sorted[1]).toEqual(['cat', 2])  // or 'and' — both are 2
    expect(sorted[0][1]).toBeGreaterThanOrEqual(sorted[1][1])
  })
})

// ---------------------------------------------------------------------------
// formatResults
// ---------------------------------------------------------------------------
describe('formatResults', function() {
  var sampleSorted = [
    ['the', 10],
    ['fox', 7],
    ['dog', 5],
    ['quick', 3],
    ['lazy', 2]
  ]

  test('produces a numbered list with word and count', function() {
    var result = utils.formatResults(sampleSorted, 3)
    expect(result).toBe(
      '1. the (10)\n' +
      '2. fox (7)\n' +
      '3. dog (5)\n'
    )
  })

  test('respects the limit parameter', function() {
    var result = utils.formatResults(sampleSorted, 2)
    var lines = result.trim().split('\n')
    expect(lines).toHaveLength(2)
  })

  test('stops at array length when limit exceeds array size', function() {
    var result = utils.formatResults(sampleSorted, 100)
    var lines = result.trim().split('\n')
    expect(lines).toHaveLength(sampleSorted.length)
  })

  test('quirk: limit=0 defaults to 10 due to || 10 fallback', function() {
    var result = utils.formatResults(sampleSorted, 0)
    // 0 is falsy, so || 10 kicks in — all 5 entries are shown
    var lines = result.trim().split('\n')
    expect(lines).toHaveLength(sampleSorted.length)
  })

  test('quirk: negative limit causes no output (Math.min returns negative)', function() {
    var result = utils.formatResults(sampleSorted, -1)
    // Math.min(5, -1) = -1 → loop condition i < -1 never executes
    expect(result).toBe('')
  })

  test('returns empty string for empty sorted array', function() {
    expect(utils.formatResults([], 10)).toBe('')
  })

  test('each line ends with a newline', function() {
    var result = utils.formatResults([['hello', 3]], 5)
    expect(result).toBe('1. hello (3)\n')
  })

  test('line numbers are 1-based', function() {
    var result = utils.formatResults(sampleSorted, 5)
    expect(result).toMatch(/^1\./)
    expect(result).toMatch(/\n5\./)
  })
})
