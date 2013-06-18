var Transform = require('stream').Transform;
var Readable = require('stream').Readable;
var util = require('util');

var mask = 0x03;
var invMask = ~0x03;

function EncodeStream(img, escByt, opts) {
  Transform.call(this, opts);
  this._img = img;
  this._len = (this._img.width * this._img.height) << 2;
  this._pos = 0;
  this._escByt = escByt;
  this._allDone = false;
}
util.inherits(EncodeStream, Transform);

EncodeStream.prototype._nextBits = function(bits) {
    var i = this._pos;
    this._img.data[i] = (this._img.data[i] & invMask) | bits;
    this._pos++;
  };

EncodeStream.prototype._nextByte = function(byt) {
    this._nextBits((byt >> 6) & mask);
    this._nextBits((byt >> 4) & mask);
    this._nextBits((byt >> 2) & mask);
    this._nextBits(byt & mask);
  };

EncodeStream.prototype._writeByte = function(byt) {
    var i = this._pos
    this._img.data[i] = (this._img.data[i] & invMask) | ((byt >> 6) & mask);
    i++;
    this._img.data[i] = (this._img.data[i] & invMask) | ((byt >> 4) & mask);
    i++;
    this._img.data[i] = (this._img.data[i] & invMask) | ((byt >> 2) & mask);
    i++;
    this._img.data[i] = (this._img.data[i] & invMask) | ((byt >> 0) & mask);
    this._pos += 4; // hack to get to next byte
  };

EncodeStream.prototype._writeFooter = function() {
    this._writeByte(this._escByt);
    this._writeByte(0x00);
  };

EncodeStream.prototype._transform = function(chunk, encoding, done) {
    for (var b = 0; b < chunk.length; b++) {
      this._nextByte(chunk[b]);
    }
    done();
  };

EncodeStream.prototype._flush = function(done) {
    this._writeFooter();
    this.emit('steganographed');
    done();
  };

function DecodeStream(imgData, escByt, opts) {
  Readable.call(this, opts);
  this._data = imgData;
  this._escByt = escByt;
  this._pos = 0;
}
util.inherits(DecodeStream, Readable);

DecodeStream.prototype._flush = function(done) {
    this.emit('end');
    done();
  };

DecodeStream.prototype._nextBit = function(dataByt) {
    return dataByt & mask;
  };

DecodeStream.prototype._nextByt = function(a, b, c, d) {
    var nextBit = this._nextBit;
    return ((nextBit(a) << 6) | 
        (nextBit(b) << 4) | 
        (nextBit(c) << 2) | 
        nextBit(d));
  };
  
DecodeStream.prototype._read = function(size) {
    if (this._allDone) {
      this.push(null);
      return;
    }

    var pos = this._pos;
    var buf = [];
    var isLastEscape = false;

    for(; pos < size*4; pos+=4) {
      // This will buffer overflow if there is not the escaped end
      var byt = this._nextByt(this._data[pos],
                              this._data[pos+1],
                              this._data[pos+2],
                              this._data[pos+3]);
      if (isLastEscape) {
        if (byt === this._escByt) {
          buf.push(byt);
        } else if (byt === 0) {
          this._allDone = true;
          this.emit('close');
          break;
        }
        isLastEscape = false;
      } else {
        if (byt === this._escByt) {
          isLastEscape = true;
          buf.push(byt);
        } else {
          buf.push(byt);
        }
      }
    }

    this._pos = pos;
    this.push(new Buffer(buf));
  };

exports.encode = function(img, escByt) {
  return new EncodeStream(img, escByt);
};

exports.decode = function(imgArr, escByt) {
  return new DecodeStream(imgArr, escByt);
};

