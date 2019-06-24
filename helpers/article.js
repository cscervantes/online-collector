var S = require('string')
var cheerio = require('cheerio')
var moment = require('moment')
var cheerioWrapper = function(html, selectors){
    try{
        var entry = ""
        var $ = cheerio.load(`<div>${html}</div>`)
        for(var i = 0; i < selectors.length; i++){
            if($(selectors[i].selector).length > 0){
                if(selectors[i].ignore.length > 0){
                    for(var j=0; j < selectors[i].ignore.length; j++){
                        var ignore_this = selectors[i].ignore[j];
                        $(ignore_this).remove();
                    }
                }
                if(selectors[i].selector.attrib != null){
                    entry = $(selectors[i].selector).eq(0).attr(selectors[i].selector.attrib)
                }else{
                    entry = $(selectors[i].selector).eq(0).html()
                    entry = S(entry).stripTags().s
                    entry = S(entry).decodeHTMLEntities().s
                    entry = S(entry).collapseWhitespace().s
                    entry = S(entry).trim().s
                    if(entry){
                        for(var j=0; j < selectors[i].replace.length; j++){
                            var repl = selectors[i].replace[j];
                            entry = S(entry).replaceAll(repl.find, repl.replace).s;
                        }    
                    }
                }
                break;
            }
        }
        // console.log(selectors)
        return entry
    }catch(e){
        return e
    }
    
}

var imgVidWrapper = function(html, selectors){
    var $ = cheerio.load(html)
    var entry = []
    for(var i = 0; i < selectors.length; i++){
        if($(selectors[i].selector).length > 0){
            if(selectors[i].ignore.length > 0){
                for(var j=0; j < selectors[i].ignore.length; j++){
                    var ignore_this = selectors[i].ignore[j];
                    $(ignore_this).remove();
                }
            }
            $(selectors[i].selector).each(function(k, w){
                entry.push($(w).attr(selectors[i].attrib))
            })
            
            break;
        }
    }
    return entry
}

exports.RawHtml = function(data, cb){
    try{
        return cb(null, cheerioWrapper(data.html, data.content))
    }catch(e){
        return cb(null, e)
    }
}

exports.Title = function(data, cb){
    try{
        return cb(null, {article_title:cheerioWrapper(data.html, data.title)})
    }catch(e){
        return cb(null, e)
    }
}

exports.Content = function(data, cb){
    try{
        return cb(null, {article_content:cheerioWrapper(data.html, data.content)})
    }catch(e){
        return cb(null, e)
    }
}

exports.DatePublished = function(data, cb){
    try{
        // console.log(cheerioWrapper(data.html, data.date_publish))
        return cb(null, {article_datetime:moment(new Date(cheerioWrapper(data.html, data.date_publish))).utcOffset(8).format('YYYY-MM-DD')})
    }catch(e){
        return cb(null, e)
    }
}

exports.Authors = function(data, cb){
    try{
        return cb(null, {article_src_aut_full_name:cheerioWrapper(data.html, data.author)})
    }catch(e){
        return cb(null, e)
    }
}

exports.Sections = function(data, cb){
    try{
        return cb(null, {article_section:cheerioWrapper(data.html, data.section)})
    }catch(e){
        return cb(null, e)
    }
}

exports.Images = function(data, cb){
    try{
        return cb(null, {images:imgVidWrapper(data.html, data.image)})
    }catch(e){
        return cb(null, e)
    }
}

exports.Videos = function(data, cb){
    try{
        return cb(null, {videos:imgVidWrapper(data.html, data.video)})
    }catch(e){
        return cb(null, e)
    }
}