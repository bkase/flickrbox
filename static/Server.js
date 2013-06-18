var Server = {
    getDB: function(done){
        this.get('/db', function(db){
            done(JSON.parse(db));
        });
    },
    requestLink: function(fileId, done){
        this.get('/file/' + fileId, done);
    },
    deleteFile: function(file, done){
        this.get('/delete/' + file, done);
    },
    sendConf: function(conf){
        this.get('/config/' + window.encodeURIComponent(JSON.stringify(conf)));
    },
    proxy: function(url, done){
        this.get('/proxy/' + window.encodeURIComponent(url), done);
    },
    get: function(url, done){
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function () {
            var res = request.responseText;
            if (done)
                done(res);
        };
        request.onerror = function(){
            throw '' + arguments;
        };
        request.send(null);
    }
}
