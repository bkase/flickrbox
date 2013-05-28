var zlib = require('zlib');
var fs = require('fs');

module.exports = function() {
  // does this have to recreated each time?
  var gzip = zlib.createGzip();
  return gzip;
};
