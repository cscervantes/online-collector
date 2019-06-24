var     async       = require('async'), 
        cheerio     = require('cheerio'),
        request     = require('request'), 
        S           = require('string');

var title, author, date_publish, content, section, images, videos;

async.waterfall([
    function(cb){
        request.get('http://www.eagle.ph/2018/04/puerto-galera-featuring-dolphin-villa/', function(error, response, body){
            if(error) {
                return cb(null, err)
            }else{
                var $ = cheerio.load(body)
                return cb(null, $)
            }
        })
    }
], function(err, result){
    // console.log(result)
    console.log(new Plugin(result).getTitle())
    console.log(new Plugin(result).getDatePublish())
    console.log(new Plugin(result).getAuthor())
    console.log(new Plugin(result).getSection())
    console.log(new Plugin(result).getContent())
    console.log(new Plugin(result).getImages())
    console.log(new Plugin(result).getVideos())
})
var Plugin = function(html){
    this.html = html
}

Plugin.prototype.getTitle = function(){
    let $ = this.html
    this.title = $('h1.entry-title').text()
    return this.title
}

Plugin.prototype.getAuthor = function(){
    let $ = this.html
    this.author = $('div.meta-info > div.td-post-author-name > a').map(function(){
        return $(this).text()
    }).get()
    return this.author
}

Plugin.prototype.getDatePublish = function(){
    let $ = this.html
    this.date_publish = $('div.meta-info > span.td-post-date > time.entry-date').attr('datetime')
    return this.date_publish
}

Plugin.prototype.getContent = function(){
    let $ = this.html
    this.content = S($('.td-post-content').html()).decodeHTMLEntities().s
    this.content = S(this.content).stripTags().s
    return S(this.content).trim().s
}

Plugin.prototype.getSection = function(){
    let $ = this.html
    this.section = $('ul.td-category li.entry-category a').map(function(){
        return $(this).text()
    }).get()
    return this.section
}

Plugin.prototype.getImages = function(){
    let $ = this.html
    this.images = $('.td-post-content img').map(function(){
        return $(this).attr('src')
    }).get()
    return this.images
}

Plugin.prototype.getVideos = function(){
    let $ = this.html
    this.videos = $('.td-post-content iframe').map(function(){
        return $(this).attr('src')
    }).get()
    return this.videos
}
