var selectors = require('./helpers/article')
var fs = require('fs')
var async = require('async')
var request = require('request')
var sample_selectors = fs.readFileSync('selectors.json', 'utf-8') // this should be coming from mongodb
var parseData = JSON.parse(sample_selectors)
// console.log(selectors)
// console.log(parseData)

// var art_url = "https://lifestyle.inquirer.net/337743/watch-sophie-turner-admits-to-trying-her-best-to-flirt-with-matthew-perry/"
// var art_url = 'https://newsinfo.inquirer.net/1128390/duterte-open-to-purchase-us-weapons-again'
// var art_url = 'https://lifestyle.inquirer.net/337421/what-do-russians-think-of-the-hbos-chernobyl/'
// var art_url = 'https://lifestyle.inquirer.net/337440/uber-helicopter-will-cost-you-200-in-new-york/'
// var art_url = 'https://lifestyle.inquirer.net/337417/meet-the-teen-climate-activist-who-just-won-an-amnesty-prize/'
// var art_url = 'https://newsinfo.inquirer.net/1130318/ncrpo-says-security-efforts-during-midterm-polls-in-metro-were-successful'
var art_url = 'https://bandera.inquirer.net/220353/sampalin-saka-kasuhan'
async.waterfall([
    function(cb){
        request.get(art_url, function(error, response, body){
            if(error){
                return cb(null, error)
            }else{
                parseData.html = body
                // console.log(parseData)
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
    
    var resultObj = result.reduce(function(result, item){
        var key = Object.keys(item)[0]
        result[key] = item[key]
        return result
    }, {})
    resultObj.article_full_url = art_url
    console.log(resultObj)
})