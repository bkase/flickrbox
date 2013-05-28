var compress = require('./compress.js');
var steno = null;
var PNG = require('pngjs').PNG;
var Q = require('q');
var _ = require('lodash');

// returns a stream of a png image
module.exports = function(fileStream, randomImage) {
  var deferred = Q.defer();
  randomImage
    .pipe(new PNG())
    .on('parsed', function() {
      fileStream
        .pipe(compress())
        .pipe(steno(this.data))
        .on('stenographed', function() {
          deferred.resolve(this.pack());
        }.bind(this));
    });
  return deferred.promise;
};

