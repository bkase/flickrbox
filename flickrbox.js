
//var EventEmitter = require('events').EventEmitter;
//var on = EventEmitter.prototype.on;
//EventEmitter.prototype.on = function (){
//    this._maxListeners = Infinity;
//    on.apply(this, arguments);
//}; 

var watchr = require('watchr');
var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;

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
console.log('watching', pathname);

function compareDBWithDir(){
    execFile('find', [ pathname ], function(err, stdout, stderr) {
      var filenames = stdout.split('\n');
      for (var i = 0; i < filenames.length; i++){
        var filename = filenames[i];
        if (filename.length === 0)
            continue;
        ensureInDB(filename);
      }
    });
}

function ensureInDB(filePath){
    // TODO store in DB md5, update if md5 changed
    fs.stat(filePath, function (err, stats) {
        if (err)
            throw err;
        if (!stats.isDirectory()){
            var localFilePath = filePath.replace(pathname, '');
            if (flickrDB.db[localFilePath] === undefined){
                var stream = fs.createReadStream(filePath, { flags: 'r' });
                flickrDB.update(filePath, localFilePath, stream);
            }
        }
    });
}

compareDBWithDir();


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
    }
});

function change(changeType, filePath, fileCurrentStat, filePreviousStat){
    if (fileCurrentStat !== null && fileCurrentStat.isDirectory())
        return;
    var localFilePath = filePath.replace(pathname, '');
    console.log(changeType, localFilePath);
    if (changeType === 'create' || changeType === 'update'){
        var stream = fs.createReadStream(filePath, { flags: 'r' });
        flickrDB.update(filePath, localFilePath, stream);
    }
    else if (changeType === 'delete'){
        flickrDB.delete(localFilePath);
    }
}
