var stega = require('./stega.js');
var esc = require('./escapist.js');
var PNG = require('pngjs').PNG;
var fs = require('fs');

// calls callback with a stream of a png image
module.exports = function(fileStream, randomImage, done) {
  randomImage
    .pipe(new PNG())
    .on('parsed', function() {
      var img = this;
      fileStream
        .pipe(esc.escape(97))
        .pipe(stega.encode(img, 97))
        .on('steganographed', function() {
          done(img.pack())
        });
    });
};

