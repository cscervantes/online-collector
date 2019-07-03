var async = require('async')
var request = require('request')

var articleHelper = require('./helpers/article_helper')
var article = 'http://daytripped-running.blogspot.com/2019/06/race-review-sunriser-run-10k.html'
// console.log(articleHelper.BlogSpot.getTitle())
// console.log(articleHelper.BlogSpot.getDate())
// console.log(articleHelper.BlogSpot.getAuthors())
// console.log(articleHelper.BlogSpot.getSections())
// console.log(articleHelper.BlogSpot.getContent())
var jsonData = {}
async.waterfall([
    function(cb){
        request.get(article, function(error, response, body){
            if(error){
                return cb(error)
            }else{
                jsonData.html = body
                jsonData.selectors = {
                    title_selectors: 'h3.entry-title',
                    date_publish_selectors: '.date-header > span',
                    author_selectors: '.g-profile > span',
                    content_selectors: '.entry-content',
                    section_selectors: 'Blogs'
                }
                return cb(null, jsonData)
            }
        })
    }, function(html, cb){
        var jsonBody = {}
        var raw = new articleHelper.BlogSpot(html)
        jsonBody.title = raw.getTitle()
        jsonBody.date_publish = raw.getDate()
        jsonBody.authors = raw.getAuthors()
        jsonBody.sections = raw.getSections()
        jsonBody.content = raw.getContent()
        return cb(null, jsonBody)
    }
], function(error, result){
    if(error) throw error;
    console.log(result)
})
