var selectors = require('./article')
var fs = require('fs')
var cheerio = require('cheerio')
var S = require('string')
var async = require('async')
var request = require('request')
var sample_selectors = fs.readFileSync('selectors.json', 'utf-8') 
var parseData = JSON.parse(sample_selectors)
// console.log(selectors)
// console.log(parseData)

// var art_url = "https://lifestyle.inquirer.net/337743/watch-sophie-turner-admits-to-trying-her-best-to-flirt-with-matthew-perry/"
// var art_url = 'https://newsinfo.inquirer.net/1128390/duterte-open-to-purchase-us-weapons-again'
var art_url = 'https://lifestyle.inquirer.net/337421/what-do-russians-think-of-the-hbos-chernobyl/'

async.waterfall([
    function(cb){
        request.get(art_url, function(error, response, body){
            if(error){
                return cb(null, error)
            }else{
                parseData.html = body
                async.parallel([
                    function(cb){
                        selectors.Title(parseData, cb)
                    }, function(cb){
                        selectors.Authors(parseData, cb)
                    }, function(cb){
                        selectors.DatePublished(parseData, cb)
                    }, function(cb){
                        selectors.Sections(parseData, cb)
                    }, function(cb){
                        selectors.Content(parseData, cb)
                    }, function(cb){
                        selectors.Images(parseData, cb)
                    }, function(cb){
                        selectors.Videos(parseData, cb)
                    }
                ], function(err, result){
                    if(err){
                        return cb(null, err)
                    }else{
                        return cb(null, result)
                    }
                })
            }
        })
    }
], function(err, result){
    if(err) throw err;
    console.log(result)
})