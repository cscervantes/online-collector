var section = require('./helpers/section')
var request = require('request')
var async   = require('async')

var websiteUrls = 'http://localhost:4000/websites/get_active_websites'
async.waterfall([
    function(cb){
        request.get(websiteUrls, function(error, response, body){
            if(error){
                return cb(null, error)
            }else{
                return cb(null, body)
            }
        })
    }, function(result, cb){
        async.eachLimit(JSON.parse(result), 1, function(res, eCb){
            setTimeout(function(){
                section.addSection(res, eCb)
            },500)
            
        }, function(err){
            if(err){
                return cb(null, err)
            }else{
                return cb(null, 'Done')
            }
        })
        
    }
], function(err, result){
    if(err){
        console.log(err)
    }else{
        console.log(result)
    }
})