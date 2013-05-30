var steno = require('../steno.js');
var esc = require('../escapist.js');
var PNG = require('pngjs').PNG;
var fs = require('fs');

function fileCompare(a, b, cmp) {
  var aContents = fs.readFileSync(a).toString();
  var bContents = fs.readFileSync(b).toString();
  if (cmp) {
    expect(cmp(aContents, bContents)).toBe(true);
  } else {
    //console.log(aContents.trim());
    //console.log(bContents.trim());
    expect(aContents.trim() === bContents.trim()).toBe(true);
  }
}

function rands(n) {
  var arr = [];
  for (var i = 0; i < n; i++) {
    arr.push(Math.round(Math.random() * 255));
  }
  return arr;
}

describe('Stenography module', function() {
  /*it('should not corrupt the data of an array', function() {
    var isDone = false;
    var size = 50;
    var imageArr = rands(size);
    var ref = { data: imageArr, width: size, height: 1 };
    var s = fs.createReadStream('small.txt')
      .pipe(esc.escape(97))
      .pipe(steno.encode(ref, 97));
    s.on('stenographed', function() {
        // TODO: Rewrite with input as filestream, and buffer mod 4
        console.log("Stenographed");
        steno.decode(imageArr, 97)
          .pipe(esc.unescape(97))
          .pipe(fs.createWriteStream('small.txt.out'))
          .on('close', function() {
            console.log("Decoded");
            fileCompare('small.txt', 'small.txt.out');
            isDone = true;
          });
      });
    waitsFor(function() { return isDone; });
  });*/

  it('should not corrupt the data with a real png', function() {
    var isDone = false;
    console.log("Test starting");
    fs.createReadStream('test.png')
      .pipe(new PNG())
      .on('parsed', function() {
        console.log("test.png parsed");
        var img = this;
        fs.createReadStream('derp.png')
          .pipe(esc.escape(97))
          .pipe(steno.encode(img, 97))
          .on('stenographed', function() {
            img.pack()
               .pipe(fs.createWriteStream('test-out.png'))
               .on('close', function() {
                  fs.createReadStream('test-out.png')
                    .pipe(new PNG())
                    .on('parsed', function() {
                      steno.decode(this.data, 97)
                           .pipe(esc.unescape(97))
                           .pipe(fs.createWriteStream('derp-out.png'))
                           .on('close', function() {
                             console.log("Decoded");
                             fileCompare('derp.png', 'derp-out.png');
                             isDone = true;
                           });
                    });
               });
          });
      });
    waitsFor(function() { return isDone; });
  });
});

