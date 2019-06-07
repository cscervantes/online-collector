var S = require('string')
var async = require('async')
var fs = require('fs')
var _ = require('lodash')


async.waterfall([
    function(cb){
        return cb(null, fs.readFileSync('gmaurls.txt', 'utf-8'))
    }, function(urls, cb){
        var arr_urls = urls.split('\n')
        var clean = arr_urls.map(function(v){
            return S(v).replaceAll('?inside_just_in', '').replaceAll('?inside_ataglance', '').s
        })
        return cb(null, Array.from(new Set(clean)))
    }
], function(error, result){
    if(error){
        throw error
    }else{
        console.log(result)
        fs.writeFile('gmafiltered.txt', JSON.stringify(_.chunk(result, 100), null, 4), 'utf-8', function(err){
            if(err) throw error;
            console.log('Save cleaned urls')
        })
    }
})