var steno = require('./steno.js');
var esc = require('./escapist.js');
var PNG = require('pngjs').PNG;
var fs = require('fs');

// calls callback with a stream of a png image
module.exports = function(fileStream, randomImage, done) {
  randomImage
    .pipe(new PNG())
    .on('parsed', function() {
      console.log("derp.png parsed");
      var img = this;
      fileStream
        .pipe(esc.escape(97))
        .pipe(steno.encode(img, 97))
        .on('stenographed', function() {
          console.log("Stenographed done");
          done(img.pack())
        });
    });
};

