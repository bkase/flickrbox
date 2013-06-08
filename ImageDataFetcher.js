var generateSearch = require('./searchGenerator.js').generateSearch;
var giSearch = require('./google-image-search.js').giSearch;
var fs = require('fs');

function ImageDataFetcher(cacheSize){
    this.cacheSize = cacheSize;
    this.numImageDataBeingRequested = 0;

    this.imagesData = [];

    this.saving = false;
    this.loadFromDisk();
    this.fillCache();

}

ImageDataFetcher.prototype = {
    loadFromDisk: function(){
        try {
            var contents = fs.readFileSync('imageData.json');
            this.imagesData = JSON.parse(contents).data;
        } catch(ex){ 

        }
    },
    saveToDisk: function(done){
        if (this.saving){
            setTimeout(function(){
                this.saveToDisk(done);
            }.bind(this), 250);
        }
        else {
            var str = JSON.stringify({ 'data': this.imagesData });
            this.saving = true;
            fs.writeFile('imageData.json', str, function(err){
                this.saving = false;
                if (err)
                    throw err;
                if (done)
                    done();
            }.bind(this));
        }
    },
    fillCache: function(){
        var toRequest = this.cacheSize - (this.imagesData.length + this.numImageDataBeingRequested);
        for (var i = 0; i < toRequest; i++){
            this.requestImageData();
        }
    },
    getImageData: function(cb){
        if (this.imagesData.length > 0){
            cb(this.imagesData.shift());
            this.saveToDisk();
        }
        else {
            setTimeout(function(){
                this.getImageData(cb);
            }.bind(this), 250);
        }
        this.fillCache();
    },
    requestImageData: function(){
        this.numImageDataBeingRequested += 1;
        generateSearch(function(err, search){
            if (err)
                throw err;
            giSearch(search, function(imgs){
                this.numImageDataBeingRequested -= 1;
                this.imagesData.push.apply(this.imagesData, imgs);
                this.saveToDisk();
            }.bind(this));
        }.bind(this));
    }
}

exports.ImageDataFetcher = ImageDataFetcher;
