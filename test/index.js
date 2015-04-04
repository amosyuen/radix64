'use strict';

var bignum = require('bignum');
var crypto = require('crypto');

var radix64Fn = require('../index');
var radix64 = radix64Fn();

describe('encode / decode buffer', function () {
  it('should encode and decode various buffer sizes', function () {
    for (var bytes = 1; bytes < 11; bytes++) {
      for (var i = 0; i < 100; i++) {
        var buffer = crypto.randomBytes(bytes);
        var encoded = radix64.encodeBuffer(buffer);
        var decoded = radix64.decodeToBuffer(encoded, bytes);
        decoded.toString('hex').should.equal(buffer.toString('hex'), 'Decoded buffer should equal original buffer');
      }
    }
  });

  it('using a fixed encoded string length should be lexicographically sortable', function () {
    for (var length = 1; length < 11; length++) {
      var bits = length * 6;
      var bytes = Math.ceil(bits / 8);
      var mask = (1 << (8 - ((bytes * 8) - bits))) - 1;
      var hexInts = [];
      var radix64Ints = [];
      for (var i = 0; i < 100; i++) {
        var buffer = crypto.randomBytes(bytes);
        buffer[0] &= mask;
        var encoded = radix64.encodeBuffer(buffer, length);
        encoded.length.should.equal(length, 'Radix 64 string should be of specified length');

        var decoded = radix64.decodeToBuffer(encoded, bytes);
        decoded.toString('hex').should.equal(buffer.toString('hex'), 'Decoded buffer should equal original buffer');

        hexInts.push(buffer.toString('hex'));
        radix64Ints.push(encoded);
      }

      hexInts.sort();
      radix64Ints.sort();
      for (i = 0; i < radix64Ints.length; i++) {
        radix64Ints[i] = radix64.decodeToBuffer(radix64Ints[i]).toString('hex');
      }
      radix64Ints.should.eql(hexInts, 'Radix 64 ints should have the same sort order as hex ints.');
    }
  });

  it('should encode and decode various bignums', function () {
    for (var power = 0; power < 1024; power++) {
      var numBase = bignum(1).shiftLeft(power);
      for (var offset = -1; offset <= 1; offset++) {
        var num = numBase.add(offset);
        var encoded = radix64.encodeBuffer(num.toBuffer());
        var decoded = bignum.fromBuffer(radix64.decodeToBuffer(encoded));
        decoded.toString(16).should.equal(num.toString(16), 'Decoded bignum should equal original bignum');
      }
    }
  });
});

describe('encode / decode int', function () {
  it('should throw error if int is out of bounds', function () {
    for (var length = 1; length < 11; length++) {
      var num = Math.pow(2, length * 6);
      var offset = 1;
      var oneLess;
      do {
        oneLess = num - offset;
        offset *= 2;
      } while(oneLess === num);
      var bounds = Math.pow(2, 6 * length);

      (function() {
        radix64.encodeInt(oneLess, length);
      })
      .should.not.throw();

      (function() {
        radix64.encodeInt(num, length);
      })
      .should.throw(Error, {
        message: 'Int (' + num + ') is greater than or equal to max bound (' + bounds + ') for encoded string length (' + length + ')'
      });
    }
  });

  it('should encode and decode various ints', function () {
    for (var power = 0; power < 1024; power++) {
      for (var offset = -1; offset <= 1; offset++) {
        var num = Math.pow(2, power) + offset;
        var encoded = radix64.encodeInt(num);
        var decoded = radix64.decodeToInt(encoded);
        decoded.should.equal(num, 'Decoded int should equal original int');
      }
    }
  });

  it('using a fixed encoded string length should be lexicographically sortable', function () {
    for (var length = 1; length < 11; length++) {
      var max = Math.pow(2, length * 6);
      var ints = [];
      var radix64Ints = [];
      for (var i = 0; i < 100; i++) {
        var num = Math.floor(Math.random() * max);
        var encoded = radix64.encodeInt(num, length);
        encoded.length.should.equal(length, 'Radix 64 string should be of specified length');

        var decoded = radix64.decodeToInt(encoded);
        decoded.should.equal(num, 'Decoded int should equal original int');

        ints.push(num);
        radix64Ints.push(encoded);
      }

      ints.sort(function(a, b) { return a - b; });
      radix64Ints.sort();
      for (i = 0; i < radix64Ints.length; i++) {
        radix64Ints[i] = radix64.decodeToInt(radix64Ints[i]);
      }
      radix64Ints.should.eql(ints, 'Radix 64 ints should have the same sort order as ints.');
    }
  });
});

describe('custom alphabet', function () {
  it('should throw error if incorrect size', function () {
    (function() {
      radix64Fn('abcd');
    })
    .should.throw(Error, {
      message: 'alphabet must be 64 characters long!',
    });
  });

  it('should throw error if duplicate characters', function () {
    (function() {
      radix64Fn('abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01');
    })
    .should.throw(Error, {
      message: 'alphabet has duplicate characters!',
    });
  });

  it('should work with custom alphabet', function () {
    (function() {
      radix64Fn('abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+/');
    })
    .should.not.throw();
  });
});
