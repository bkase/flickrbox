var Transform = require('stream').Transform;
var util = require('util');

function EscapeStream(escapeByte, opts) {
  Transform.call(this, opts);
  this._escapeByte = escapeByte;
}
util.inherits(EscapeStream, Transform);

EscapeStream.prototype._transform = function(chunk, encoding, done) {
  console.log("Escaping");
  var buf = [];
  for (var i = 0; i < chunk.length; i++) {
    var byt = chunk[i];
    if (byt == this._escapeByte) {
      buf.push(byt);
      buf.push(byt);
    } else {
      buf.push(byt);
    }
  }
  this.push(new Buffer(buf));
  done();
};

function UnescapeStream(escapeByte, opts) {
  Transform.call(this, opts);
  this._escapeByte = escapeByte;
  this._hangingEscape = false;
}
util.inherits(UnescapeStream, Transform);

UnescapeStream.prototype._transform = function(chunk, encoding, done) {
  var i = 0;
  var buf = [];
  if (this._hangingEscape) {
    if (chunk[0] === this._escapeByte) {
      buf.push(chunk[0]);
    }
    this._hangingEscape = false;
    i++; // we already absorbed this character
  }

  for (; i < chunk.length; i++) {
    var byt = chunk[i];
    if (byt === this._escapeByte) {
      i++;
      if (i+1 >= chunk.length) {
        this._hangingEscape = true;
      } else if (chunk[i] === this._escapeByte) {
        buf.push(byt);
      } else {
        // don't push byt
      }
    } else {
      buf.push(byt);
    }
  }
  this.push(new Buffer(buf));
  done();
};

exports.escape = function(byt) {
  return new EscapeStream(byt);
}

exports.unescape = function(byt) {
  return new UnescapeStream(byt);
}


