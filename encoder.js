var steno = require('./steno.js');
var esc = require('./escapist.js');
var PNG = require('pngjs').PNG;
var fs = require('fs');
var Readable = require('stream').Readable;

// calls callback with a stream of a png image
module.exports = function(fileStream, randomImage, done) {
  randomImage
    .pipe(new PNG())
    .on('parsed', function() {
      var img = this;
      new Readable().wrap(fileStream)
        .pipe(esc.escape(97))
        .pipe(steno.encode(img, 97))
        .on('stenographed', function() {
          done(img.pack())
        });
    });
};

