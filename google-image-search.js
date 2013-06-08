var request = require('request');
var cheerio = require('cheerio');

function properCase(str){
    return str.replace(/\w\S*/g, function(word){
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
}

exports.giSearch = function(search, cb){
    search = search.replace(/ /g, '+');
    var url = 'http://www.google.com/search?tbm=isch&as_rights=cc_publicdomain&q=' + search;
    request.get({
            url: url
        }, function(err, resp, html){
            var $ = cheerio.load(html);
            var links = $('a').map(function(){ return $(this).attr('href'); });
            links = links.filter(function(str){
                return str.indexOf('/imgres?') === 0; 
            });
            var urls = links.map(function(link){
                return link.match(/imgurl=(.*?)&/)[1];
            });
            var ws = links.map(function(link){
                return link.match(/w=(.*?)&/)[1];
            });
            var hs = links.map(function(link){
                return link.match(/h=(.*?)&/)[1];
            });
            var titles = links.map(function(link){
                return link.match(/imgrefurl=(.*?)&/)[1];
            });
            titles = titles.map(function(title){
                title = title.replace('http://commons.wikimedia.org/wiki/', '');
                title = title.replace('https://commons.wikimedia.org/wiki/', '');
                title = title.replace('Https://commons.wikimedia.org/wiki/', '');
                title = title.replace('File:', '');
                title = title.replace(/_/g, ' ');
                title = title.replace('.jpg', '');
                title = title.replace('.png', '');
                title = title.replace('.bmp', '');
                title = title.replace('.gif', '');
                title = properCase(title);
                return title;
            });
            var imgs = [];
            for (var i = 0; i < urls.length; i++){
                var img = {
                    url: urls[i],
                    title: titles[i],
                    w: ws[i],
                    h: hs[i]
                };
                if (!img.w || !img.h || !img.title || !img.url)
                    continue;
                imgs.push(img);
            }
            cb(imgs);
    });
}

