'use strict';

var radix64 = require('./index')();
var crypto = require('crypto');

var TRIALS = 10;

var buffers = [];
var encodedBuffers = [];
var base64Buffers = [];

var ints = [];
var encodedInts = [];

// Prepare randomized buffers and ints
for (var i = 0; i < 1000000; i++) {
  var buffer = crypto.randomBytes(8);
  buffers.push(buffer);
  encodedBuffers.push(radix64.encodeBuffer(buffer));
  base64Buffers.push(buffer.toString('base64'));

  var int = Math.floor(Math.random() * Math.pow(2,54));
  ints.push(int);
  encodedInts.push(radix64.encodeInt(int));
}

function benchmark(name, inputs, trials, fn) {
  var time = 0;
  for (var i = 0; i < trials; i++) {
    var start = new Date();
    for (var j = 0; j < inputs.length; j++) {
      fn(inputs[j]);
    }
    time += (new Date() - start);
  }
  console.log('%s: %d', name, Math.round(time / 10));
}

benchmark('radix64.encodeBuffer(buffer)', buffers, TRIALS, function(buffer) { radix64.encodeBuffer(buffer); });
benchmark('radix64.decodeToBuffer(string)', encodedBuffers, TRIALS, function(string) { radix64.decodeToBuffer(string); });

benchmark('buffer.toString(\'base64\')', buffers, TRIALS, function(buffer) { buffer.toString('base64'); });
benchmark('new Buffer(string, \'base64\')', encodedBuffers, TRIALS, function(string) { new Buffer(string, 'base64'); });

benchmark('radix64.encodeInt(int)', ints, TRIALS, function(int) { radix64.encodeInt(int); });
benchmark('radix64.decodeToInt(string)', encodedInts, TRIALS, function(string) { radix64.decodeToInt(string); });
