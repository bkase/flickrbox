
(function(){
    var EventEmitter = require('events').EventEmitter;
    var on = EventEmitter.prototype.on;
    EventEmitter.prototype.on = function (){
        this._maxListeners = Infinity;
        return on.apply(this, arguments);
    }; 
})();

var watchr = require('watchr');
var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;

var debug = process.argv[2] === 'DEBUG' || process.argv[3] === 'DEBUG';
var log = function(){ };
if (debug)
    log = console.log.bind(console);

var FlickrFileBrowser = require('./FlickrFileBrowser').FlickrFileBrowser;

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var confPath = getUserHome() + '/.flickrbox-conf.json';

var pathname;
var flickrDB
var fileBrowser;

var FlickrDB = require('./FlickrDB').FlickrDB;

if (!fs.existsSync(confPath)){
    var port = (process.argv[2] !== 'DEBUG' && process.argv[2]) || 8080;
    console.log('go to localhost:' + port + '/ in a browser to setup');
    fileBrowser = new FlickrFileBrowser(port, undefined);
    fileBrowser.onconfig = function(conf){
        fs.writeFileSync(confPath, JSON.stringify(conf));
        pathname = conf.file_pathname;
        flickrDB = new FlickrDB(conf);
        fileBrowser.flickrDB = flickrDB;
        init();
    }
}
else {
    var conf = require(confPath);
    pathname = conf.file_pathname;
    flickrDB = new FlickrDB(conf);
    fileBrowser = new FlickrFileBrowser(conf.file_browser_port, flickrDB);
    init();
}


function init(){

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
        // TODO delete from DB if deleted 
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
}
