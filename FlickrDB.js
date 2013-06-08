var fs = require('fs');
var FlickrStore = require('./FlickrStore.js').FlickrStore;
var ImageFetcher = require('./ImageFetcher.js').ImageFetcher;

var ImageMagick = require('./ImageMagick.js');

var encoder = require('./encoder');

var Readable = require('stream').Readable;

var FlickrDB = function(conf){
    this.store = new FlickrStore(conf);
    this.db = {};
}

function create(store, size, stream, cb){
    console.log(size);
    var imageFetcher = new ImageFetcher(10);
    var escapedMaxSize = Math.ceil(size*1.1); //BUG BUG BUG TODO 
    imageFetcher.getClosestMatch(escapedMaxSize, function(img){
        var scale = Math.sqrt(escapedMaxSize/(img.w*img.h));
        var newW = Math.ceil(scale*img.w);
        var newH = Math.ceil(scale*img.h);
        if (newW < 100)
            newW = 100;
        if (newH < 100)
            newH = 100;
        var png = ImageMagick.crop(img.data, newW, newH);
        encoder(stream, png, function(encodedImgStream){
            var wrappedStream = new Readable().wrap(encodedImgStream);
            wrappedStream.pipe(fs.createWriteStream('test.png'))
                         .on('close', function(){
                            var photo = {
                                title: "a title!",
                                description: "a  description!",
                                photo: fs.createReadStream('test.png', { flags: 'r' })
                            }
                            store.add(photo, function(err, id){
                                if (err)
                                    throw err;
                                cb(id);
                            });
                         });
        });
    });
}

function getFileSize(file, cb){
    fs.stat(file, function (err, stats) {
        if (err)
            throw err;
        cb(stats.size);
    });
}



FlickrDB.prototype = {
    update: function(fullPath, localPath, stream){
        if (this.db[localPath] === undefined){
            //create
            this.db[localPath] = 'in progress';
            getFileSize(fullPath, function(size){
                create(this.store, size, stream, function(id){
                    this.db[localPath] = id;
                    console.log(id);
                }.bind(this));
            }.bind(this));
        }
        else {
            //update
        }
    },
    delete: function(){

    }
}

exports.FlickrDB = FlickrDB;
