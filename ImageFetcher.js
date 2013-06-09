var request = require('request');
var ImageDataFetcher = require('./ImageDataFetcher.js').ImageDataFetcher;

var imageDataFetcher = new ImageDataFetcher(10);

function ImageFetcher(cacheSize){
    this.cacheSize = cacheSize;
    this.numImageBeingRequested = 0;

    this.images = [];

    this.fillCache();
}

ImageFetcher.prototype = {
    getClosestMatch: function(size, cb){
        var closestDiff = 100000000000000;
        var closestImage = null;
        for (var i = 0; i < this.images.length; i++){
            var imgSize = this.images[i].w*this.images[i].h;
            var diff = Math.abs(size - imgSize);
            if (diff < closestDiff){
                closestImage = this.images[i];
                closestDiff = diff;
            }
        }

        if (closestImage === null){
            setTimeout(function(){
                this.getClosestMatch(size, cb);
            }.bind(this), 250);
        }
        else {
            cb(closestImage);
        }
        this.fillCache();
    },
    fillCache: function(){
        var imagesToRequest = this.cacheSize - (this.images.length + this.numImageBeingRequested);
        for (var i = 0; i < imagesToRequest; i++){
            this.requestImage();
        }
    },
    requestImage: function(){
        imageDataFetcher.getImageData(function(img){
            img.data = request(img.url);
            this.images.push(img);
        }.bind(this));
    }
}

exports.ImageFetcher = ImageFetcher;
