# main browsers or IE
# skip the US in en-US and so on

tempFn=(path)->
  try
    temp=require(path)
  catch e
    throw e

  (data={})->
    # lang=window.uiLanguage or  navigator.language or navigator.userLanguage
    lang=document.cookie.slice(-2,) or window.uiLanguage
    mainLang=lang?.slice(0,2) or ""
    
    localUi={}
    for k,v of window.uiData
      if not v[lang]
        console.log("#{lang} on #{k} is not supported. Falling back on English")
        localUi[k]=v["en"]
      else
        localUi[k]=v[mainLang]
    merged=_.extend({UI:localUi},arguments[0])
    data.UI=localUi
    res=temp(data)
    #console.log(res,"res")
    res

module.exports=tempFn