var fs = require('fs');
var generateSearch = require('../searchGenerator.js').generateSearch;

var giSearch = require('../google-image-search.js').giSearch;

generateSearch(function(err, search){
    if (err)
        throw err;
    console.log(search);
    giSearch(search, function(imgs){
        console.log(imgs);
    });
});

