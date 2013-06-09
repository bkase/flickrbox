var Server = {
    getDB: function(done){
        this.get('/db', function(db){
            done(JSON.parse(db));
        });
    },
    requestLink: function(fileId, done){
        this.get('/file/' + fileId, done);
    },
    get: function(url, done){
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function () {
            var res = request.responseText;
            done(res);
        };
        request.onerror = function(){
            throw '' + arguments;
        };
        request.send(null);
    }
}
