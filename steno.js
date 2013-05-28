var Transform = require('stream').Transform;
var util = require('util');

var mask = 0x03;
var invMask = ~0x03;

function EncodeStream(img, opts) {
  Transform.call(this, opts);
  this._img = img;
  this._y = 0;
  this._x = 0;
  this._colorChan = 0;
  this._allDone = false;
}
util.inherits(EncodeStream, Transform);


EncodeStream.prototype {
  _increment: function(byt) {
    this._colorChan++;
    if (this._colorChan === 4) {
      this._colorChan = 0;
      if (this._x === this._img.width) {
        this._x = 0;
        if (this._y === this._img.height) {
          return true;
        }
      }
    }
    return false;
  },

  _nextBits: function(bits) {
    var i = ((this._img.width * this._y + this._x) << 2) + this._colorChan;
    this.data[i] = (this.data[i] & invMask) | bits;
    return this._increment();
  },

  _nextByte: function(byt) {
    return this._nextBits((byt >> 6) & mask) ||
      this._nextBits((byt >> 4) & mask) ||
      this._nextBits((byt >> 2) & mask) ||
      this._nextBits(byt & mask);
  },

  _transform: function(chunk, encoding, done) {
    if (this._allDone) {
      done();
      return;
    }

    var img = this._img;
    for (var b = 0; b < chunk.length; b++) {
      if (this._nextByte(chunk[b])) {
        this.emit('stenographed');
        this._allDone = true;
        break;
      }
    }
    done();
  }
};

module.exports = {
  encode: function(img) {
    return new EncodeStream(img);
  },
  
  decode: function() {
    return new DecodeStream();
  }
};

