
var FlickrStore = require('../FlickrStore.js').FlickrStore;
var conf = require('../flickr-conf.json');

var fs = require('fs');

var store = new FlickrStore(conf);

var photo = {
    title: 'test',
    description: 'waorsitn',
    photo: fs.createReadStream('/home/evan/tmp/background.png', { flags: 'r' })
}

//store.deleteAll(console.log);

//store.add(photo, function(err, id){
//    if (err)
//        throw err;
//    console.log(id);
//    store.get(id, function(err, res){
//        res.pipe(fs.createWriteStream('test.png'));
//    });
//});

//store.add(photo, function(err, id){
//    if (err)
//        throw err;
//    console.log(id);
//    var photo = fs.createReadStream('/home/evan/tmp/q05.png', { flags: 'r' });
//    store.set(id, photo, function(err, res){
//        console.log(arguments);
//    });
//});
