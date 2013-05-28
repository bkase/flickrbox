
var Flickr = require('./Flickr.js').Flickr;

var async = require('async');

var request = require('request');

function FlickrStore(conf){
    this.flickr = new Flickr(conf);
    this.setName = conf.photoset_name;
    this.setId = undefined;
}

function getPhotosetId(flickr, setName, cb){
    flickr.getPhotosetList(function(err, response){
        if (err){
            cb(err);
            return;
        }
        if (!response.photosets ||
            !response.photosets.photoset
        ){
             cb('bad response')
             return;
        }

        for (var i = 0; i < response.photosets.photoset.length; i++){
            var photoset = response.photosets.photoset[i];
            if (photoset.title._content == setName){
                cb(null, photoset.id);
                return;
            }
        }
        cb('could not find photoset');
        return;
    });
}

function checkForSetIdThenRun(fn){
    if (!this.setId){
        getPhotosetId(this.flickr, this.setName, function(err, id){
            if (err){
                fn(err);
                return;
            }
            this.setId = id;
            fn();
        }.bind(this));
    }
    else {
        fn();
    }
}

FlickrStore.prototype = {
    list: function(cb){
        checkForSetIdThenRun.bind(this)(function(err){
            if (err){
                cb(err);
                return;
            }
            this.flickr.listPhotos(this.setId, function(err, res){
                if (err){
                    cb(err);
                    return;
                }
                cb(null, res.photoset.photo);
            }.bind(this));
        }.bind(this));
    },
    deleteAll: function(cb){
        this.list(function(err, photos){
            if (err){
                cb(err);
                return;
            }

            var numberDone = 0;
            for (var i = 0; i < photos.length; i++){
                this.delete(photos[i].id, function(){
                    numberDone += 1;
                    if (numberDone == photos.length)
                        cb();
                }.bind(this));
            }
        }.bind(this));
    },
    delete: function(id, cb){
        this.flickr.deletePhoto(id, cb);
    },
    get: function(id, cb){
        this.flickr.getPhotoInfo(id, function(err, res){
            if (err){
                cb(err);
                return;
            }
            var photo = res.photo;
            var farm = photo.farm;
            var server = photo.server;
            var secret = photo.originalsecret;
            var url = 'http://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '_' + 'o.png';
            request.head(url, function(err, res, body){
                cb(null, request(url));
            });
        });
    },
    set: function(id, photoFile, cb){
        this.flickr.replace(photoFile, id, cb);
    },
    add: function(photo, cb){
        var _photoId;
        async.waterfall([
            function getId(next){
                this.flickr.uploadPrivate(photo, function(err, response){
                    if (err)
                        next(err)
                    else
                        next(null, response.photoid);
                });
            }.bind(this),
            function addToPhotoset(photoId, next){
                _photoId = photoId;
                if (!this.setId){
                    getPhotosetId(this.flickr, this.setName, function(err, setId){
                        if (err){
                            this.flickr.createPhotoset({
                                'title': this.setName,
                                'primary_photo_id': photoId 
                            }, function(err, res){
                                if (err)
                                    next(err, null);
                                else {
                                    this.setId = res.photoset.id;
                                    next(null, photoId);
                                }
                            }.bind(this));
                        }
                        else {
                            this.setId = setId;
                            this.flickr.addPhotoToSet(photoId, this.setId, next);
                        }
                    }.bind(this));
                }
                else {
                    this.flickr.addPhotoToSet(photoId, this.setId, next);
                }
            }.bind(this),
        ], function(err, result){
            if (err){
                cb(err);
                return;
            }
            cb(null, _photoId);
        }.bind(this));

        //if (!this.setId){
        //    this.flickr.createPhotoset({
        //        'title': this.setName,
        //        'primary_photo_id': id
        //    }, function(){
        //        console.log(arguments);
        //    }.bind(this));
        //}
    }

}

var PhotoTemplate = {
    title: null,
    description: null,
    photo: null
}

exports.FlickrStore = FlickrStore;
