var Transform = require('stream').Transform;
var util = require('util');

function BufferModN(n, opts) {
  Transform.call(this, opts);
  this._n = n;
  this._carryOver = [];
}
util.inherits(BufferModN, Transform);

function pushAll(buf, things) {
  for (var i = 0; i < things.length; i++) {
    buf.push(things[i]);
  }
}

BufferModN.prototype._transform = function(chunk, encoding, done) {
  var buf = [];
  var fixedChunk = Buffer.concat([new Buffer(this._carryOver), chunk]);
  var len = fixedChunk.length;
  if (len % this._n === 0) {
    pushAll(buf, fixedChunk);
    this._carryOver = [];
  } else {
    var index = -1 * (len % this._n);
    if (index !== 0) {
      this._carryOver = fixedChunk.slice(index);
      pushAll(buf, fixedChunk.slice(0, index));
    } else {
      pushAll(buf, fixedChunk);
      this._carryOver = [];
    }
  }
  this.push(new Buffer(buf));
  done();
};
BufferModN.prototype._flush = function(done) {
  if (this._carryOver.length === 0) {
    done();
    return;
  }
  
  var a = [];
  for (var i = 0; i < this._n; i++) {
    a.push(0);
  }

  this.push(
      Buffer.concat([new Buffer(this._carryOver), new Buffer(a)]).slice(0, this._n));
  done();
};

module.exports = function(n) {
  return new BufferModN(n);
};

