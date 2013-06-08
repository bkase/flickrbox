var ImageFetcher = require('../ImageFetcher.js').ImageFetcher;
var ImageDataFetcher = require('../ImageDataFetcher.js').ImageDataFetcher;

var imageFetcher = new ImageFetcher(10);

imageFetcher.getClosestMatch(10000, function(img){
    console.log(img);
});

