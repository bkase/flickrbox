var compress = null;
var steno = null;
var rgbify = null;
var pngify = null;
var _ = require('lodash');

module.exports = function(data, randomImage) {
  return pngify(compress(data), rgbify(randomImage));
};

