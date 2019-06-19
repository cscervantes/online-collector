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
                    console.log(`Error Crawling ${element} ${JSON.stringify(error)}`)
                    return cb(null, error)
                }else{
                    console.log(`Crawling website ${data.website_url}`)
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
            return cb(null, filteredSections.sort())
        }, function(sections, cb){
            var sections = sections.map(function(v){
                return S(v).replaceAll('https://', 'http://').s
            })
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
    console.log('ENVIRONMENT: '+process.env.NODE_ENV)
    var sections = data.main_sections
    // console.log(sections)
    var subTasks = []
    sections.forEach(element => {
        subTasks.push(function(cb){
            setTimeout(function(){
                fetchDomain(element, function(error, response, body){
                    if(error) {
                        console.log(`Error Crawling ${element} ${JSON.stringify(error)}`)
                        return cb(null, error)
                    }else{
                        // return cb(null, body)
                        console.log(`Crawling section ${element}`)
                        async.waterfall([
                            function(cb){
                                var section_urls = []
                                var $ = cheerio.load(body)
                                $('a').each(function(i, e){
                                    section_urls.push($(e).attr('href'))
                                })
                                var rmMedia = removeSocialMedia(section_urls)
                                var cleanUrls = cleanUrl(data.website_url, rmMedia)
                                var needEndSlash = needSlash(data.needs_endslash, cleanUrls)
                                var uniqueUrls = Array.from(new Set(needEndSlash))
                                return cb(null, _.union(data.sub_sections.concat(uniqueUrls)))
                            }, function(filterUrls, cb){
                                // console.log(data.section_config)
                    
                                var filteredSections = filterUrls
                    
                                var startWith = data.sub_section_config.startsWith
                                var toStrstartWith = startWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var endWith = data.sub_section_config.endsWith
                                var toStrendWith = endWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var containWith = data.sub_section_config.containsWith
                                var toStrcontainWith = containWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var exactWith = data.sub_section_config.exact
                                var toStrexactWith = exactWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var acceptWith = data.sub_section_config.accept_only
                                var toStracceptWith = acceptWith.map(function(v){
                                    return 'f.includes(\''+v+'\')'
                                })
                    
                                var regexInclude = data.sub_section_config.regex_include
                                var toStrregexInclude = regexInclude.map(function(v){
                                    return 'f.search('+v+') != -1'
                                })
                    
                                var regexExclude = data.sub_section_config.regex_exclude
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
                                return cb(null, filteredSections.sort())
                            }, function(sections, cb){
                               return cb(null, sections)  
                            }
                        ], function(err, results){
                            if(err) {
                                return cb(null, err)
                            }else{
                                return cb(null, results)
                            }
                        })
                    }
                })
            }, 1500)
            
        })
    });

    async.parallelLimit(subTasks, 1, function(err, results){
        if(err) {
            return cb(null, err)
        }
        else {
            var subsections = S(_.join(results)).splitLeft(',')
            subsections = subsections.map(function(v){
                return !v.includes('Error:') && S(v).replaceAll('https://', 'http://').s
            })
            subsections = _.uniq(subsections)
            subsections = subsections.filter(Boolean)
            if(process.env.NODE_ENV === 'production'){
                var update_uri = 'http://localhost:4000/websites/update/'+data._id
                updateMainSections(update_uri, {json:{sub_sections:subsections, date_updated: new Date()}}, function(error, response, body){
                    if(error){
                        return cb(null, error)
                    }else{
                        return cb(null, body)
                    }
                })
            }else{
                console.log(subsections)
                return cb(null, subsections)
            }              
        }
    })
}

exports.fetchSectionArticles = function(data, cb){
    console.log('ENVIRONMENT: '+process.env.NODE_ENV)
    var sections = Array.from(new Set(data.main_sections.concat(data.sub_sections))).sort()
    // sections = sections.splice(0, 2) //remove this later for testing only
    if(sections.length > 0){
        console.log(`Using section urls(${sections.length}) of ${data.website_name}`)
        async.eachLimit(sections, 1, function(section, eCb){
            setTimeout(function(){
                fetchDomain(section, function(error, response, body){
                    console.log(`Fetching article link of ${section}`)
                    if(error){
                        console.log(error)
                        return eCb()
                    }else{
                        async.waterfall([
                            function(cb){
                                var article_urls = []
                                var $ = cheerio.load(body)
                                $('a').each(function(i, e){
                                    article_urls.push($(e).attr('href'))
                                })
                                var rmMedia = removeSocialMedia(article_urls)
                                var cleanUrls = cleanUrl(data.website_url, rmMedia)
                                var needEndSlash = needSlash(data.needs_endslash, cleanUrls)
                                var uniqueUrls = Array.from(new Set(needEndSlash))
                                return cb(null, uniqueUrls)
                            }, function(articles, cb){
                                var filteredSections = articles
                    
                                var startWith = data.article_config.startsWith
                                var toStrstartWith = startWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var endWith = data.article_config.endsWith
                                var toStrendWith = endWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var containWith = data.article_config.containsWith
                                var toStrcontainWith = containWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var exactWith = data.article_config.exact
                                var toStrexactWith = exactWith.map(function(v){
                                    return '!f.includes(\''+v+'\')'
                                })
                    
                                var acceptWith = data.article_config.accept_only
                                var toStracceptWith = acceptWith.map(function(v){
                                    return 'f.includes(\''+v+'\')'
                                })
                    
                                var regexInclude = data.article_config.regex_include
                                var toStrregexInclude = regexInclude.map(function(v){
                                    return 'f.search('+v+') != -1'
                                })
                    
                                var regexExclude = data.article_config.regex_exclude
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
                                return cb(null, filteredSections.sort())
                            }
                        ], function(error, result){
                            if(error){
                                console.log(error)
                                return eCb()
                            }else{
                                var articles = S(_.join(result)).splitLeft(',')
                                articles = articles.map(function(v){
                                    return !v.includes('Error:') && S(v).replaceAll('https://', 'http://').s
                                })
                                articles = _.uniq(articles)
                                articles = articles.filter(Boolean)
                                console.log(`Filtered article urls(${articles.length})`)
                                if(process.env.NODE_ENV === 'production'){
                                    async.eachLimit(articles, 10,  function(article_url, eCb2){
                                        setTimeout(function(){
                                            request.post('http://localhost:4000/articles/store', {json: {article_full_url: article_url, article_src_url:data.fqdn, publication:data._id}}, function(error, response, body){
                                                if(error){
                                                    console.log(error)
                                                    return eCb2()
                                                }else{
                                                    console.log(body)
                                                    return eCb2()
                                                }
                                            })
                                        }, 500)
                                    }, function(err){
                                        if(err){
                                            console.log(err)
                                            return eCb()
                                        }else{
                                            console.log(`Done saving.`)
                                            return eCb()
                                        }
                                    })
                                }else{
                                    console.log(result)
                                    return eCb()
                                }
                            } // end of else condition
                        }) // end of async  waterfall    
                    } // end of else condition
                }) // end of fetchDomain function
                
            }, 1000)
        }, function(err){
            if(err){
                return cb(null, err)
            }else{
                return cb(null, 'Done')
            }
        })
    }else{
        console.log(`Using the default home url ${data.website_url}`)
    }
}
