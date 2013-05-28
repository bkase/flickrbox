var compress = null;
var steno = null;
var rgbify = null;
var pngify = null;
var Q = require('q');
var _ = require('lodash');

// returns a stream of a png image
module.exports = function(fileStream, randomImage) {
  var deferred = Q.defer();
  rgbify(randomImage, function() {
    deferred.resolve(
      fileStream
          .pipe(compress)
          .pipe(steno(randomImage))
          .pipe(pngify)
    );
  });

  return deferred.promise();
};

