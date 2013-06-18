var stega = require('./stega.js');
var esc = require('./escapist.js');
var PNG = require('pngjs').PNG;
var _ = require('lodash');

// calls callback with a stream of decoded data
module.exports = function(encodedImageStream, done) {
  encodedImageStream
    .pipe(new PNG())
    .on('parsed', function() {
      console.log("Image is parsed");
      var fileStream = 
        stega.decode(this.data, 97)
             .pipe(esc.unescape(97));

      done(fileStream);
    });
};

