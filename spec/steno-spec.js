var steno = require('../steno.js');
var fs = require('fs');

function fileCompare(a, b, cmp) {
  var aContents = fs.readFileSync(a).toString();
  var bContents = fs.readFileSync(b).toString();
  if (cmp) {
    expect(cmp(aContents, bContents)).toBe(true);
  } else {
    expect(aContents.trim() === bContents.trim()).toBe(true);
  }
}

function zeros(n) {
  var arr = [];
  for (var i = 0; i < n; i++) {
    arr.push(0);
  }
  return arr;
}

describe('Stenography module', function() {
  it('should not corrupt the data', function() {
    var isDone = false;
    var imageArr = zeros(10000);
    fs.createReadStream('test.txt')
      .pipe(steno.encode(ref))
      .on('stenographed', function() {
        steno.decode({ data: imageArr, width: 10000, height: 1 })
          .pipe(fs.createWriteStream('test.txt.out'))
          .on('close', function() {
            expect(fileCompare('test.txt', 'test.txt.out'))
              .toBe(true);
            isDone = true;
          });
      });
    waitsFor(function() { return isDone; });
  });
});
