

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