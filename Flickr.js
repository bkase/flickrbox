var FlickrClient = require('./flickr-with-uploads_patched.js').Flickr;

function Flickr(conf){
    this.client = new FlickrClient(conf.consumer_key, conf.consumer_secret, 
                            conf.oauth_token, conf.oauth_token_secret);

}

Flickr.prototype = {
    upload: function(uploadConfig, cb){
        return sendFromClient(this.client, 'upload', uploadConfig, cb);
    },
    uploadPrivate: function(uploadConfig, cb){
        uploadConfig.is_public = 0;
        uploadConfig.is_friend = 0;
        uploadConfig.is_family = 0;
        uploadConfig.hidden = 2;
        this.upload(uploadConfig, cb);
    },
    replace: function(photo, photoId, cb){
        return sendFromClient(  this.client,
                                'replace',
                                { photo: photo, photo_id: photoId },
                                cb);
    },
    getPhotoInfo: function(photoId, cb){
        return sendFromClient(  this.client,
                                'flickr.photos.getInfo',
                                { photo_id: photoId },
                                cb);
    },
    addPhotoToSet: function(photoId, photosetId, cb){
        return sendFromClient(  this.client, 
                                'flickr.photosets.addPhoto', 
                                { photo_id: photoId, photoset_id: photosetId },
                                cb);
    },
    deletePhoto: function(photoId, cb){
        return sendFromClient(this.client, 'flickr.photos.delete', { photo_id: photoId }, cb);
    },
    listPhotos: function(set, cb){
        if (set){
            return sendFromClient(this.client, 'flickr.photosets.getPhotos', { photoset_id: set }, cb);
        }
        else {
            return sendFromClient(this.client, 'flickr.photos.getNotInSet', { }, cb);
        }
    },
    createPhotoset: function(createPhotosetConfig, cb){
        return sendFromClient(this.client, 'flickr.photosets.create', createPhotosetConfig, cb);
    },
    getPhotosetList: function(cb){
        return sendFromClient(this.client, 'flickr.photosets.getList', { }, cb);
    }
    
}

function sendFromClient(client, method, data, callback){
    return client.createRequest(method, data, true, callback).send();
}

var UploadTemplate = {
    'title': null,
    'description': null,
    'is_public': null,
    'is_friend': null,
    'is_family': null,
    'hidden': null,
    'photo': null
}

var CreatePhotosetTemplate = {
    'title': null,
    'description': null,
    'primary_photo_id': null
}

exports.Flickr = Flickr;
