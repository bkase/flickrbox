var fs = require('fs');
var FlickrStore = require('./FlickrStore.js').FlickrStore;
var ImageFetcher = require('./ImageFetcher.js').ImageFetcher;
var crypto = require('crypto');

var ImageMagick = require('./ImageMagick.js');

var encoder = require('./encoder');

var Readable = require('stream').Readable;

var FlickrDB = function(conf){
    this.conf = conf;
    this.store = new FlickrStore(conf);
    this.db = {};
    this.saving = false;
    this.loadFromDisk();
    for (var file in this.db){
        if (this.db[file] === 'in progress'){
            delete this.db[file];
        }
    }

}

function create(store, size, stream, key, cb){
    var imageFetcher = new ImageFetcher(10);
    var escapedMaxSize = Math.ceil(size*1.2); //BUG BUG BUG TODO
    imageFetcher.getClosestMatch(escapedMaxSize, function(img){
        var scale = Math.sqrt(escapedMaxSize/(img.w*img.h));
        var newW = Math.ceil(scale*img.w);
        var newH = Math.ceil(scale*img.h);
        var png = ImageMagick.crop(img.data, newW, newH);
        var encryptedStream = stream.pipe(crypto.createCipher('aes-256-cbc', key));
        encoder(encryptedStream, png, function(encodedImgStream){
          console.log("Encoded successfully");
            var tempFileName = Math.random() + '-out.png';
            // TODO(#3): Figure out a way to convert `encodedImgStream`
            //           to a streams1 compatible stream
            var wrappedStream = new Readable().wrap(encodedImgStream);
            wrappedStream.pipe(fs.createWriteStream(tempFileName))
                         .on('close', function(){
                            console.log("Wrote successfully");
                            var photo = {
                                title: img.title,
                                description: "",
                                photo: fs.createReadStream(tempFileName, { flags: 'r' })
                            }
                            store.add(photo, function(err, id){
                                console.log("Added successfully");
                                if (err)
                                    throw err;
                                fs.unlink(tempFileName);
                                cb(id);
                            });
                         });
        });
    }.bind(this));
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
        var key = this.conf.crypto_key;
        if (this.db[localPath] === undefined){
            //create
            this.db[localPath] = 'in progress';
            getFileSize(fullPath, function(size){
                create(this.store, size, stream, key, function(id){
                    this.db[localPath] = id;
                    this.saveToDisk();
                }.bind(this));
            }.bind(this));
        }
        else {
            //update
            var oldId = this.db[localPath];
            this.db[localPath] = 'in progress';
            getFileSize(fullPath, function(size){
                create(this.store, size, stream, key, function(id){
                    this.db[localPath] = id;
                    this.saveToDisk();
                    this.store.delete(oldId);
                }.bind(this));
            }.bind(this));
        }
    },
    delete: function(localPath){
        this.store.delete(this.db[localPath]);
        delete this.db[localPath];
        this.saveToDisk();
    },
    hasReady: function(localPath){
        return  this.db[localPath] !== undefined &&
                this.db[localPath] !== "in progress";
    },
    loadFromDisk: function(){
        try {
            var contents = fs.readFileSync('db.json');
            this.db = JSON.parse(contents);
        } catch(ex){ 

        }
    },
    get: function(localFilePath, cb){
        var fileId = this.db[localFilePath];
        this.store.get(fileId, cb);
    },
    saveToDisk: function(done){
        if (this.saving){
            setTimeout(function(){
                this.saveToDisk(done);
            }.bind(this), 250);
        }
        else {
            var str = JSON.stringify(this.db);
            this.saving = true;
            fs.writeFile('db.json', str, function(err){
                this.saving = false;
                if (err)
                    throw err;
                if (done)
                    done();
            }.bind(this));
        }
    },
}

exports.FlickrDB = FlickrDB;
