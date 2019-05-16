var request = require('request')
var cheerio = require('cheerio')
var S       = require('string')
var async   = require('async')

var fetchDomain = function(url, cb){
    request.get(url, cb)
}

var removeSocialMedia = function(urls){
    return urls.filter(function(v){
      return v !== '' && v !== '#' && v !== undefined && !v.includes('mailto:') && !v.includes('facebook.com') && !v.includes('twitter.com') && !v.includes('youtube.com') && !v.includes('instagram.com') && !v.includes('google.com')
    })
  }

var cleanUrl = function(domain, urls){
    var new_urls = []
    for(url of urls){
        if(S(url).startsWith('//')){
            new_urls.push('http:'+url)
        }else if(S(url).startsWith('/')){
            new_urls.push(domain+url)
        }else{
            new_urls.push(url)
        }
    }
    return new_urls
}

var needSlash = function(need_endslash, urls){
    if(need_endslash){
        return urls.map(function(v){
            return S(v).ensureRight('/').s
        })
    }else{
        return urls.map(function(v){
            return S(v).chompRight('/', '').s
        })
    }
}

exports.addSection = function(data, cb){
    console.log('ENVIRONMENT: '+process.env.NODE_ENV)
    if(data.scraper_setting === 'REGEX_CONFIG'){
        async.waterfall([
            function(cb){
                var section_urls = []
                fetchDomain(data.website_url, function(error, response, body){
                    if(error){
                        return cb(null, error)
                    }else{
                        var $ = cheerio.load(body)
                        $('a').each(function(i, e){
                            section_urls.push($(e).attr('href'))
                        })
                        var rmMedia = removeSocialMedia(section_urls)
                        var cleanUrls = cleanUrl(data.website_url, rmMedia)
                        var needEndSlash = needSlash(data.needs_endslash, cleanUrls)
                        var uniqueUrls = Array.from(new Set(needEndSlash))
                        return cb(null, uniqueUrls)
                    }
                })
            }, function(filterUrls, cb){
                console.log(data.regex_config)

                var filteredSections = filterUrls

                var startWith = data.regex_config.startsWith
                var toStrstartWith = startWith.map(function(v){
                    return '!f.includes(\''+v+'\')'
                })

                var endWith = data.regex_config.endsWith
                var toStrendWith = endWith.map(function(v){
                    return '!f.includes(\''+v+'\')'
                })

                var containWith = data.regex_config.containsWith
                var toStrcontainWith = containWith.map(function(v){
                    return '!f.includes(\''+v+'\')'
                })

                var exactWith = data.regex_config.exact
                var toStrexactWith = exactWith.map(function(v){
                    return '!f.includes(\''+v+'\')'
                })

                var acceptWith = data.regex_config.accept
                var toStracceptWith = acceptWith.map(function(v){
                    return 'f.includes(\''+v+'\')'
                })


                if(startWith.length > 0){
                    var filteredSections = filteredSections.filter(function(f){
                        return eval(toStrstartWith.join(' && '))
                    })
                }
                    
                if(endWith.length > 0){
                    var filteredSections = filteredSections.filter(function(f){
                        return eval(toStrendWith.join(' && '))
                    })
                }

                if(containWith.length > 0){
                    var filteredSections = filteredSections.filter(function(f){
                        return eval(toStrcontainWith.join(' && '))
                    })
                }

                if(exactWith.length > 0){
                    var filteredSections = filteredSections.filter(function(f){
                        return eval(toStrexactWith.join(' && '))
                    })
                }

                if(acceptWith.length > 0){
                    var filteredSections = filteredSections.filter(function(f){
                        return eval(toStracceptWith.join(' && '))
                    })
                }


                    

                    // var regex_not = filteredSections.filter(function(f){
                    //     return f.search(/\/(\d+)\//g) == -1
                    // })
                return cb(null, filteredSections)
            }
        ], function(err, result){
            if(err){
                return cb(null, err)
            }else{
                console.log(result)
                return cb(null, result)
            }
        })
        
    }else if(data.scraper_setting === 'SECTION_CONFIG'){
        console.log(data.regex_config.skip_exact_url)
        async.waterfall([
            function(cb){
                var section_urls = []
                fetchDomain(data.website_url, function(error, response, body){
                    if(error){
                        return cb(null, error)
                    }else{
                        var $ = cheerio.load(body)
                        $('a').each(function(i, e){
                            section_urls.push($(e).attr('href'))
                        })
                        var rmMedia = removeSocialMedia(section_urls)
                        var cleanUrls = cleanUrl(data.website_url, rmMedia)
                        var needEndSlash = needSlash(data.needs_endslash, cleanUrls)
                        var uniqueUrls = Array.from(new Set(needEndSlash))
                        return cb(null, uniqueUrls)
                    }
                })
            }
        ], function(err, result){
            if(err){
                return cb(null, err)
            }else{
                console.log(result)
                return cb(null, result)
            }
        })
    }else{
        async.waterfall([
            function(cb){
                var section_urls = []
                fetchDomain(data.website_url, function(error, response, body){
                    if(error){
                        return cb(null, error)
                    }else{
                        var $ = cheerio.load(body)
                        $('a').each(function(i, e){
                            section_urls.push($(e).attr('href'))
                        })
                        var rmMedia = removeSocialMedia(section_urls)
                        var cleanUrls = cleanUrl(data.website_url, rmMedia)
                        var needEndSlash = needSlash(data.needs_endslash, cleanUrls)
                        var uniqueUrls = Array.from(new Set(needEndSlash))
                        return cb(null, uniqueUrls)
                    }
                })
            }
        ], function(err, result){
            if(err){
                return cb(null, err)
            }else{
                console.log(result)
                return cb(null, result)
            }
        })
    }
    
}