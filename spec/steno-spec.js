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
  it('should not corrupt the data with a real png', function() {
    var isDone = false;
    console.log("Test starting");
    fs.createReadStream('derp.png')
      .pipe(new PNG())
      .on('parsed', function() {
        console.log("derp.png parsed");
        var img = this;
        fs.createReadStream('star@2x.png')
          .pipe(esc.escape(97))
          .pipe(steno.encode(img, 97))
          .on('stenographed', function() {
            console.log("Stenographed done");
            img.pack()
               .pipe(fs.createWriteStream('derp-out.png'))
               .on('close', function() {
                  fs.createReadStream('derp-out.png')
                    .pipe(new PNG())
                    .on('parsed', function() {
                      steno.decode(this.data, 97)
                           .pipe(esc.unescape(97))
                           .pipe(fs.createWriteStream('star@2x-out.png'))
                           .on('close', function() {
                             console.log("Decoded");
                             fileCompare('star@2x.png', 'star@2x-out.png');
                             isDone = true;
                           });
                    });
               });
          });
      });
    waitsFor(function() { return isDone; });
  });
});

