var bufmodn = require('../buffer-mod-n.js');
var fs = require('fs');

describe('Buffer mod n, buffers such that all pushes are multiples of n', function() {
  it('should result in a file with mod n bytes', function() {
    var isDone = false
    fs.createReadStream('test.txt')
      .pipe(bufmodn(4))
      .pipe(fs.createWriteStream('test.txt.out'))
      .on('close', function() {
        fs.stat('test.txt.out', function(err, stats) {
          expect(stats.size > 0).toBe(true);
          expect(stats.size % 4 === 0).toBe(true);
          isDone = true;
        });
      });

    waitsFor(function() { return isDone; });
  });
});

