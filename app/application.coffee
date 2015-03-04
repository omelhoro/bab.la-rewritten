# The application object.
uiLangs=require "/models/localization/ui_langs"
module.exports = class Application extends Chaplin.Application

  start: ->
    # TODO: cookie getting like that doesnt work well and is uglyyy
    cookie=document.cookie
    console.log(cookie)
    langs=(k.langCode or k.countryCode for k in uiLangs)
    ix=cookie.indexOf("lang")
    lang=cookie.slice(ix+5,ix+7)
    window.uiLanguage=if langs.indexOf(lang)>-1 then lang else navigator.language.slice(0,2)
    document.cookie="lang=#{window.uiLanguage}; max-age=#{60*60}; path=/"
    $.getLocale().then((data)=>
      window.uiData=data
      super()
    )
  #   # You can fetch some data here and start app
  #   # (by calling `super`) after that.
  #   super
