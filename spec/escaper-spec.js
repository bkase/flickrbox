var esc = require('../escapist');
var fs = require ('fs');

function fileCompare(a, b, cmp) {
  var aContents = fs.readFileSync(a).toString();
  var bContents = fs.readFileSync(b).toString();
  if (cmp) {
    expect(cmp(aContents, bContents)).toBe(true);
  } else {
    expect(aContents.trim() === bContents.trim()).toBe(true);
  }
}

describe('Escapist the module that escapes bytes', function() {
  it('should escape the escape character', function() {
    var isDone = false;
    fs.createReadStream('test.txt')
      .pipe(esc.escape(97))
      .pipe(fs.createWriteStream('test.txt.out'))
      .on('close', function() {
        isDone = true;
      });

    waitsFor(function() { return isDone; });
  });

  it('should remove all escape characters except for the escape escape when being unescaped', function() {
    var isDone = false;
    fs.createReadStream('test.txt')
      .pipe(esc.unescape(97))
      .pipe(fs.createWriteStream('test.txt.out'))
      .on('close', function() {
        var t = fs.readFileSync('test.txt.out').toString();
        expect(t.indexOf('a') === -1).toBe(true);
        isDone = true;
      });

    waitsFor(function() { return isDone; });
  });

  it('should unescape(escape(x)) === x', function() {
    var isDone = false;
    fs.createReadStream('test.txt')
      .pipe(esc.escape(97))
      .pipe(esc.unescape(97))
      .pipe(fs.createWriteStream('test.txt.out'))
      .on('close', function() {
        fileCompare('test.txt', 'test.txt.out');
        isDone = true;
      });

    waitsFor(function() { return isDone; });
  });
});

