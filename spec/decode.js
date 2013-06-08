var fs = require('fs');

var file = process.argv[2];
var decoder = require('../decoder');
decoder(fs.createReadStream(file),
    function(decodedFileStream) {
        decodedFileStream.pipe(fs.createWriteStream(file + '.out'));
    });
