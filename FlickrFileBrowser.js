var fs = require('fs');
var express = require("express");
var app = express();

var decoder = require('./decoder');

app.use(express.static(__dirname + '/static'));

function FlickrFileBrowser(port, flickrDB){
    this.flickrDB = flickrDB;
    app.listen(port);

    app.get('/db', function(req, res){
        res.send(flickrDB.db);
    });

    app.get('/file/*', function(req, res){
        var localFilePath = req.url.substring(6);
        this.flickrDB.get(localFilePath, function(err, stream){
            if (err)
                throw err;
            decoder(stream,
                function(decodedFileStream) {
                    decodedFileStream.pipe(res);
                });
        });
    }.bind(this));
}

exports.FlickrFileBrowser = FlickrFileBrowser;
