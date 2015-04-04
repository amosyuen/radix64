'use strict';

var BASE = 64;
var BASE_BITS = 6;

// Use URL safe characters in lexicographically sorted order
var LEXICOGRAPHICAL_BASE64_URL = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
  .split('').sort().join('');

module.exports = function (alphabet) {
  alphabet = alphabet || LEXICOGRAPHICAL_BASE64_URL;
  if (alphabet.length !== BASE) {
    throw new Error('alphabet must be ' + BASE + ' characters long!');
  }

  var charToDec = {};
  for (var i = 0; i < alphabet.length; i++) {
    var char = alphabet[i];
    if (char in charToDec) {
      throw new Error('alphabet has duplicate characters!');
    }
    charToDec[char] = i;
  }

  function encodeBuffer(buffer, length) {
    length = length || Math.ceil(buffer.length * 8 / 6);
    var chars = new Array(length);

    var i = 1; // start at 1 to avoid subtracting by 1
    var bufferIndex = buffer.length - 1;
    var hang = 0;
    do {
      var bufferByte;
      switch (i % 4) {
        case 1:
          bufferByte = buffer[bufferIndex--];
          chars[chars.length - i] = alphabet[bufferByte & 0x3F];
          hang = bufferByte >> 6;
          break;
        case 2:
          bufferByte = buffer[bufferIndex--];
          chars[chars.length - i] = alphabet[((bufferByte & 0x0F) << 2) | hang];
          hang = bufferByte >> 4;
          break;
        case 3:
          bufferByte = buffer[bufferIndex--];
          chars[chars.length - i] = alphabet[((bufferByte & 0x03) << 4) | hang];
          hang = bufferByte >> 2;
          break;
        case 0:
          chars[chars.length - i] = alphabet[hang];
          break;
      }
      i++;
    } while (bufferIndex >= 0 && i <= chars.length);

    if ((i % 4 ) !== 1) {
      chars[chars.length - i] = alphabet[hang];
      i++;
    }
    while (i <= chars.length) {
      chars[chars.length - i] = alphabet[0];
      i++;
    }

    return chars.join(''); 
  }

  function encodeInt(num, length) {
    if (length) {
      var bounds = Math.pow(2, 6 * length);
      if (num >= bounds) {
        throw new Error('Int (' + num + ') is greater than or equal to max bound (' + bounds + ') for encoded string length (' + length + ')');
      }
    } else {
      var log = Math.log2(num);
      if (Math.pow(2, Math.round(log)) === num) {
        log++;
      }
      length = Math.max(1, Math.ceil(log / BASE_BITS));
    }

    var chars = new Array(length);
    var i = chars.length - 1;
    while (num > 0) {
      chars[i--] = alphabet[num % BASE];
      num = Math.floor(num / BASE);
    }
    while (i >= 0) {
      chars[i--] = alphabet[0];
    }
    return chars.join('');
  }

  function decodeToBuffer(string, bytes) {
    var i = 1; // start at 1 to avoid subtracting by 1
    var buffer = new Buffer(bytes || Math.ceil(string.length * BASE_BITS / 8));
    var bufferIndex = buffer.length - 1;
    do {
      var dec = charToDec[string[string.length - i]];
      switch (i % 4) {
        case 1:
          buffer[bufferIndex] = dec;
          break;
        case 2:
          buffer[bufferIndex--] |= (dec & 0x3) << 6;
          buffer[bufferIndex] = dec >> 2;
          break;
        case 3:
          buffer[bufferIndex--] |= (dec & 0xF) << 4;
          buffer[bufferIndex] = dec >> 4;
          break;
        case 0:
          buffer[bufferIndex--] |= dec << 2;
          break;
      }
      i++;
    } while (bufferIndex >= 0 && i <= string.length);

    if (i % 4 === 1) {
      bufferIndex++;
    }
    if (bufferIndex > 0) {
      buffer.fill(0, 0, bufferIndex);
    }

    return buffer;
  }

  function decodeToInt(string) {
    var i = 0;
    var num = 0;
    do {
      num = num * BASE + charToDec[string[i]]; 
      i++;
    } while (i < string.length);

    return num;
  }

  return {
    encodeBuffer: encodeBuffer,
    encodeInt: encodeInt,
    decodeToBuffer: decodeToBuffer,
    decodeToInt: decodeToInt,
  };
};
