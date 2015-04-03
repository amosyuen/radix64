# Description
---
Fast and efficient integer conversion library for arbitrary radix 64 alphabets designed. Allows you to convert any size integer to and from any 64 radix alphabet. Has options to format strings so that they are lexicographically sortable. This library was designed for ID generation.

**Note:** While similar **radix64** is not the same as **base64**.

**base64** is for converting binary data and so starts converting from the most significant byte to least.
**radix64** is for converting integers from base 10 to base 64 and so starts converting with the least significant byte to most.

With **radix64** you can generate encoded strings of any length whereas **base64** must always have encoded strings with a length that is a multiple of 4. Therefore **radix64** doesn't need padding characters and can more efficiently represent the bits.

### Example
Decimal | Radix64 | Base64
------|------|-------
0     |-     |AA==
1     |0     |AQ==  
2     |1     |Ag==  
4     |3     |BA==  
8     |7     |CA==  
16    |F     |EA==  
32    |V     |IA==  
64    |0-    |QA==  
128   |1-    |gA==  
256   |3-    |AQA=  
512   |7-    |AgA=
1024  |F-    |BAA=
2048  |V-    |CAA=
4096  |0--   |EAA=

<br>
# Usage
---
```js
var radix64 = require('radix-64')();
```

#### radix64.encodeBuffer(buffer[, length])
Encodes a buffer into a radix 64 string.
* **buffer** - binary buffer
* **length** [Optional] - Length of the desired encoded string. If not specified uses the minimum length needed to encode the buffer.

#### radix64.encodeInt(integer[, length])
Encodes an integer into a radix 64 string.
* **integer** - Javascript integer 
* **length** [Optional] -  Length of the desired encoded string. If not specified uses the minimum length needed to encode the integer.

#### radix64.decodeToInt(string[, bytes])
Decodes a radix 64 string to a buffer
* **string** - radix 64 string
* **bytes** [Optional] - Int of bytes of the desired decoded buffer. If not specified uses the minimum bytes needed to decode the string.

#### radix64.decodeToBuffer(string)
Decodes a radix 64 string to an integer
* **string** - radix 64 string

<br>
### Lexicographical Sorting
If you want lexicographically sortable encoded integers, you need to specify an encoded string length. This will prepend the integers with leading characters to make sure all the encoded integers are the same length so that they can be compared lexicographically.
```js
var radix64 = require('radix-64')();

var encoded = radix64.encodeInt(1234567890);
console.log('%s', encoded); // 08_VAH

var encodedLexicographically = radix64.encodeInt(1234567890, 10);
console.log('%s', encodedLexicographically); // ----08_VAH
```

<br>
### More integer precision
JavaScript numbers only have **53** bits of integer precision. To convert larger integers with more precision use encodeBuffer(). It takesany size buffers in Big Endian format. It is also compatible with bignum and bigint libraries.
```js
var radix64 = require('radix-64')();

var num = bignum.pow(2, 63);
var encoded = radix64.encodeBuffer(num.toBuffer());

var decoded = radix64.decodeToBuffer(encoded);
var decodedNum = bignum.fromBuffer(decoded);
```

<br>
### Custom Alphabets
The default alphabet used is a lexicographically sorted base 64 URL alphabet. However you can specify any alphabet by passing a 64 character string to the function. If you want your alphabet to be lexicographically sortable make sure to sort the characters.
```js
var LEXICOGRAPHICAL_BASE64_URL =
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
    .split('').sort().join(''); // Ensure in sorted order
var radix64 = require('radix-64')(alphabet);
```

<br>
# Performance
Benchmarks on an Amazon EC2 micro-2 instance. The times are for 1 million calls averaged over 10 runs. Uses random pre-generated 64 bit buffers or 53 bit integers as inputs. You can see the radix64 functions performance for buffers are as fast as if not faster than native node base64 conversion functions.

Function | Time (Milliseconds)
--------------------------------|----
radix64.encodeBuffer(buffer)    |207
radix64.decodeToBuffer(string)  |506
buffer.toString('base64')       |254
new Buffer(string, 'base64')    |1314
radix64.encodeInt(int)          |1295
radix64.decodeToInt(string)     |137
