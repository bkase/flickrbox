var fs = require('fs');
var express = require("express");
var app = express();
var request = require('request');

var decoder = require('./decoder');
var crypto = require('crypto');

app.use(express.bodyParser());

function FlickrFileBrowser(port, flickrDB){
    this.flickrDB = flickrDB;
    app.listen(port);

    app.get('/db', function(req, res){
        res.send(flickrDB.db);
    });

    app.get('/', function(req, res, next){
        if (this.flickrDB === undefined)
            res.sendfile('static/setup.html');
        else
            next();
    }.bind(this));

    app.get('/file/*', function(req, res){
        var localFilePath = req.url.substring(6);
        if (this.flickrDB.hasReady(localFilePath)){
            this.flickrDB.get(localFilePath, function(err, stream){
                if (err)
                    throw err;
                decoder(stream,
                    function(decodedFileStream) {
                        decodedFileStream
                          .pipe(crypto.createDecipher('aes-256-cbc', this.flickrDB.conf.crypto_key))
                          .pipe(res);
                    }.bind(this));
            }.bind(this));
        }
        else {
            res.send("updating file");
        }
    }.bind(this));

    app.get('/delete/*', function(req, res){
        var localFilePath = req.url.substring(8);
        if (this.flickrDB.hasReady(localFilePath)){
            this.flickrDB.delete(localFilePath);
            res.send('file deleted');
        }
        else {
            res.send("updating file");
        }

    }.bind(this));

    app.get('/proxy/*', function(req, res){
        var url = decodeURIComponent(req.url.substring(7));
        console.log(url);
        request.get(url).pipe(res);
    });

    app.get('/config/*', function(req, res){
        var configStr = req.url.substring(8);
        var config = JSON.parse(decodeURIComponent(configStr));

        if (this.onconfig)
            this.onconfig(config);

        res.redirect('/');
        
    }.bind(this))

    app.use(express.static(__dirname + '/static'));
}

exports.FlickrFileBrowser = FlickrFileBrowser;
