var spawn = require('child_process').spawn;
var Stream = require('stream');
 
exports.crop = function(streamIn, w, h){
     
    var command = 'convert';
     
    // http://www.imagemagick.org/Usage/resize/#space_fill
    var args = [
        "-", // use stdin
        "-resize", w + "x", // resize width to 640
        "-resize", "x" + h, // resize height if it's smaller than 360
        "-gravity", "center", // sets the offset to the center
        "-crop", w + "x" + h + "+0+0", // crop
        "+repage", // reset the virtual canvas meta-data from the images.
        "png:-" // output to stdout
    ];
     
    var proc = spawn(command, args);
     
    var stream = new Stream();
     
    proc.stderr.on('data', stream.emit.bind(stream, 'error'));
    proc.stdout.on('data', stream.emit.bind(stream, 'data'));
    proc.stdout.on('end', stream.emit.bind(stream, 'end'));
    proc.on('error', stream.emit.bind(stream, 'error'));
     
    streamIn.pipe(proc.stdin);
     
    return stream;
};
 
