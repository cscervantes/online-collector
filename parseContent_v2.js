var selectors = require('./helpers/article')
var fs = require('fs')
var async = require('async')
var request = require('request')
// var sample_selectors = fs.readFileSync('selectors.json', 'utf-8') // this should be coming from mongodb
// var parseData = JSON.parse(sample_selectors)


async.waterfall([
    function(cb){
        request.get('http://localhost:4000/articles/queued_articles', function(error, response, body){
            if(error) {
                return cb(null, error)
            }else{
                return cb(null, body)
            }
        })
    },
    function(queuedArticles, cb){
        async.eachLimit(JSON.parse(queuedArticles), 1, function(queuedArticle, eCb){
            // console.log(queuedArticle)
            setTimeout(function(){
                async.waterfall([
                    function(cb){
                        request.get(queuedArticle.article_full_url, function(error, response, body){
                            if(error){
                                return cb(null, error)
                            }else{
                                var parseData = queuedArticle.publication.selectors
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
                    
                    var resultObj = result.reduce(function(result, item){
                        var key = Object.keys(item)[0]
                        result[key] = item[key]
                        return result
                    }, {})
                    resultObj.article_full_url = queuedArticle.article_full_url
                    console.log(resultObj)
                    return eCb()
                })
            }, 1000)
        }, function(err){
            if(err){
                console.log(err)
                return cb()
            }else{
                console.log('Done')
                return cb()
            }
        })
        
    }
], function(error){
    if(error){
        console.log(error)
    }else{
        console.log('Done')
        // console.log(parseData)
    }
})

// async.waterfall([
//     function(cb){
//         request.get(art_url, function(error, response, body){
//             if(error){
//                 return cb(null, error)
//             }else{
//                 parseData.html = body
//                 async.parallel([
//                     function(cb){
//                         selectors.Title(parseData, cb)
//                     }, function(cb){
//                         selectors.Authors(parseData, cb)
//                     }, function(cb){
//                         selectors.DatePublished(parseData, cb)
//                     }, function(cb){
//                         selectors.Sections(parseData, cb)
//                     }, function(cb){
//                         selectors.Content(parseData, cb)
//                     }, function(cb){
//                         selectors.Images(parseData, cb)
//                     }, function(cb){
//                         selectors.Videos(parseData, cb)
//                     }
//                 ], function(err, result){
//                     if(err){
//                         return cb(null, err)
//                     }else{
//                         return cb(null, result)
//                     }
//                 })
//             }
//         })
//     }
// ], function(err, result){
//     if(err) throw err;
    
//     var resultObj = result.reduce(function(result, item){
//         var key = Object.keys(item)[0]
//         result[key] = item[key]
//         return result
//     }, {})
//     resultObj.article_full_url = art_url
//     console.log(resultObj)
// })