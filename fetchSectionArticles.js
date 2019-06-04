var section = require('./section')
var request = require('request')
var cheerio = require('cheerio')
var S       = require('string')
var async   = require('async')

var website = 'http://localhost:4000/websites/get_active_websites'

async.waterfall([
    function(cb){
        request.get(website, function(error, response, body){
            if(error){
                return cb(null, error)
            }else{
                return cb(null, body)
            }
        })
    }, function(websites, cb){
        var websites = JSON.parse(websites)
        var websiteTasks = []
        websites.forEach(element => {
            websiteTasks.push(function(cb){
                setTimeout(function(){
                    section.fetchSectionArticles(element, cb)
                }, 500)
            })
        });
        
        async.parallelLimit(websiteTasks, 2, function(error, result){
            if(error){
                return cb(null, error)
            }else{
                return cb(null, result)
            }
        })
    }
], function(error, result){
    if(error) throw error;
    else console.log(result);
})