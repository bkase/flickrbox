var encoder = require('../encoder');
var decoder = require('../decoder');
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

describe('Encoder/Decoder modules', function() {
  it('should keep x = decode(encode(x))', function() {
    var isDone = false;
    encoder(fs.createReadStream('star@2x.png'), 
            fs.createReadStream('derp.png'),
            function(encodedImageStream) {
              console.log("got encodedImageStream");
              encodedImageStream
                .pipe(fs.createWriteStream('derp-out.png'))
                .on('close', function() {
                    console.log("onclose happened for derp-out.png");
                    decoder(fs.createReadStream('derp-out.png'),
                            function(decodedFileStream) {
                              console.log("got decodedFileStream");
                              decodedFileStream
                                .pipe(fs.createWriteStream('star@2x-out.png'))
                                .on('close', function() {
                                  fileCompare('star@2x.png', 'star@2x-out.png');
                                  isDone = true;
                                });
                            });

                });
        });

    waitsFor(function() { return isDone; });
  });
});

