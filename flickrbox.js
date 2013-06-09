
//var EventEmitter = require('events').EventEmitter;
//var on = EventEmitter.prototype.on;
//EventEmitter.prototype.on = function (){
//    this._maxListeners = Infinity;
//    on.apply(this, arguments);
//}; 

var watchr = require('watchr');
var fs = require('fs');
var path = require('path');

var conf = require('./flickr-conf.json');
var FlickrDB = require('./FlickrDB').FlickrDB;
var flickrDB = new FlickrDB(conf);

var FlickrFileBrowser = require('./FlickrFileBrowser').FlickrFileBrowser;

var fileBrowser = new FlickrFileBrowser(conf.file_browser_port, flickrDB);

var debug = process.argv[3] !== undefined;
var log = function(){ };
if (debug)
    log = console.log.bind(console);

var pathname = path.resolve(process.argv[2]);
console.log(pathname);

watchr.watch({
    paths: [ pathname ],
    listeners: {
        log: function(logLevel){
            log('a log message occured:', arguments);
        },
        error: function(err){
            console.warn('an error occured:', err);
        },
        watching: function(err,watcherInstance,isWatching){
            if (err) {
                log("watching the path " + watcherInstance.path + " failed with error", err);
            } else {
                log("watching the path " + watcherInstance.path + " completed");
            }
        },
        change: change
    },
    next: function(err,watchers){
        if (err) {
            return log("watching everything failed with error", err);
        } else {
            log('watching everything completed', watchers);
        }

        //// Close watchers after 60 seconds
        //setTimeout(function(){
        //    var i;
        //    console.log('Stop watching our paths');
        //    for ( i=0;  i<watchers.length; i++ ) {
        //        watchers[i].close();
        //    }
        //},60*1000);

        fs.writeFile(pathname + '/test.txt', "Hello Terrabyte of Space!");
    }
});

function change(changeType, filePath, fileCurrentStat, filePreviousStat){
    var localFilePath = filePath.replace(pathname, '');
    if (changeType === 'create'){
        var stream = fs.createReadStream(filePath, { flags: 'r' });
        console.log("Encoding " + path.basename(filePath) + "...");
        flickrDB.update(filePath, localFilePath, stream);
    }
}
