var compress = require('../compress.js');
var fs = require('fs');

describe("Simple compression module", function() {
  
  it("should reduce the size of an ascii file", function() {
    var isDone = false;
    fs.createReadStream('test.txt')
      .pipe(compress)
      .pipe(fs.createWriteStream('test.txt.out'))
      .on('close', function() {
        fs.stat('test.txt', function(err, stats) {
          fs.stat('test.txt.out', function(err2, statsComp) {
            if (err || err2) {
              throw (err + err2);
            }
            expect(statsComp.size < stats.size).toBe(true);
            isDone = true;
          });
        });
      });
    waitsFor(function() { return isDone; });
  });
});
