var request         = require('request'),
    S               = require('string'),
    fs              = require('fs'),
    async           = require('async');

var _config         = fs.readFileSync('./default_section_config/index.json', 'utf-8');
var _section        = require('./helpers/section')

var _uri = 'http://192.168.3.250:4000/v0/websites/get_website_id_fqdn'
var _getWebsites = function(cb){
    request.get(_uri, cb)
}
async.waterfall([
    function(cb){ // get active websites
        _getWebsites(function(error, response, body){
            if(error) {
                return cb(error)
            }else{
                console.log(response.statusCode)
                return cb(null, JSON.parse(body))
            }
        })
    }, function(result, cb){
        async.eachLimit(result.splice(0, 1), 2, function(d, eCb){
            setTimeout(function(){
                d.main_section_config = JSON.parse(_config)
                d.website_url = d.home_url
                d.main_sections = d.section_urls
                d.needs_endslash = false
                delete d.home_url
                delete d.section_urls
                // console.log(d)
                _section.automateLocalSection(d, function(err, data){
                    if(err){
                        console.log(err)
                        return eCb()
                    }else{
                        console.log(data)
                        return eCb()
                    }
                })
                
            }, 1000)
        }, function(err){
            if(err){
                return cb(err)
            }else{
                return cb(null, 'Done')
            }
        })
    }
], function(err, result){
    if(err) {
        console.error(err)
    }
    else {
        console.log(result);
    } 
    // console.log(result.splice(0,2))
    // console.log(_config)
})
