var cheerio = require('cheerio')
var S       = require('string')

function loadCheerio(html)
{
    return cheerio.load(html)
}
var BlogSpot = function(data){
    this.html = data.html
    this.selector = data.selectors
}

BlogSpot.prototype.getTitle = function(){
    return loadCheerio(this.html)(this.selector.title_selectors).text()
}

BlogSpot.prototype.getDate = function(){
    return loadCheerio(this.html)(this.selector.date_publish_selectors).text()
}

BlogSpot.prototype.getAuthors = function(){
    return loadCheerio(this.html)(this.selector.author_selectors).text()
}

BlogSpot.prototype.getSections = function(){
    return loadCheerio(this.html)(this.selector.section_selectors).text() || 'Blog'
}

BlogSpot.prototype.getContent =  function(){
    return loadCheerio(this.html)(this.selector.content_selectors).text() 
}
module.exports = BlogSpot