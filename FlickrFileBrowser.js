var fs = require('fs');
var express = require("express");
var app = express();
var request = require('request');
var crypto = require("crypto");

var decoder = require('./decoder');

app.use(express.bodyParser());

function FlickrFileBrowser(conf, flickrDB){
    var port = conf.file_browser_port;
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
                console.log("Got file successfully");
                if (err)
                    throw err;
                decoder(stream,
                    function(decodedFileStream) {
                        console.log("Decoded file");
                        decodedFileStream
                            .pipe(crypto.createDecipher('aes-256-cbc', conf.crypto_key))
                            .pipe(res);
                    });
            });
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
