var request = require('request')
var cheerio = require('cheerio')
var S       = require('string')
var async   = require('async')
var _       = require('lodash')

var fetchDomain = function(url, cb){
    request.get(url, cb)
}

var updateMainSections = function(url, sections, cb){
    request.put(url, sections, cb)
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
                    return cb(null, _.union(data.main_sections.concat(uniqueUrls)))
                }
            })
        }, function(filterUrls, cb){
            // console.log(data.section_config)

            var filteredSections = filterUrls

            var startWith = data.main_section_config.startsWith
            var toStrstartWith = startWith.map(function(v){
                return '!f.includes(\''+v+'\')'
            })

            var endWith = data.main_section_config.endsWith
            var toStrendWith = endWith.map(function(v){
                return '!f.includes(\''+v+'\')'
            })

            var containWith = data.main_section_config.containsWith
            var toStrcontainWith = containWith.map(function(v){
                return '!f.includes(\''+v+'\')'
            })

            var exactWith = data.main_section_config.exact
            var toStrexactWith = exactWith.map(function(v){
                return '!f.includes(\''+v+'\')'
            })

            var acceptWith = data.main_section_config.accept_only
            var toStracceptWith = acceptWith.map(function(v){
                return 'f.includes(\''+v+'\')'
            })

            var regexInclude = data.main_section_config.regex_include
            var toStrregexInclude = regexInclude.map(function(v){
                return 'f.search('+v+') != -1'
            })

            var regexExclude = data.main_section_config.regex_exclude
            var toStrregexExclude = regexExclude.map(function(v){
                return 'f.search('+v+') == -1'
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

            if(regexInclude.length > 0){
                var filteredSections = filteredSections.filter(function(f){
                    return eval(toStrregexInclude.join(' && '))
                })
            }

            if(regexExclude.length > 0){
                var filteredSections = filteredSections.filter(function(f){
                    return eval(toStrregexExclude.join(' && '))
                })
            }
            return cb(null, filteredSections)
        }, function(sections, cb){
            if(process.env.NODE_ENV === 'production'){
                var update_uri = 'http://localhost:4000/websites/update/'+data._id
                updateMainSections(update_uri, {json:{main_sections:sections, date_updated: new Date()}}, function(error, response, body){
                    if(error){
                        return cb(null, error)
                    }else{
                        return cb(null, body)
                    }
                })
            }else{
                return cb(null, sections)
            }                
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

exports.addSubSection = function(data, cb){

}