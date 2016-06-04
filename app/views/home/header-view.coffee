View = require 'views/base/view'
subappps=require 'models/base/subapps'
uiLanguages=require 'models/localization/ui_langs'

module.exports = class HeaderView extends View
  autoRender: true
  className: 'header'
  tagName: 'header'

  events:{
    "click .lang-choice-item":"changeLang"
  }
  changeLang:(evt)=>
    #TODO: need to reload ui when language is changed
    lang=$(evt.target).data("lang")
    window.uiLanguage=lang
    document.cookie="lang=#{lang}; max-age=#{60*60}; path=/"
    console.log(lang,window.uiLanguage,"lang,window.uiLanguage")
    $.getLocale(lang,"en").then((data)=>
      console.log(window.uiLanguage,"window.uiLanguage")
      window.uiData=data
      window.App.dispatcher.currentController.view.render()
      @render()
    )

  template: () ->
    tempFn=$.tfn('/views/home/templates/header')
    # copy to set the active link
    currentNav=subappps.slice(0).map((e)->
      e.active=if e.link==HeaderView.path then true else false
      e.name=
        if window.uiData
          (window.uiData[e.link][window.uiLanguage] or
            window.uiData[e.link]["en"])
        else e.name
      e
    )
    activeLang=window.uiLanguage
    # coffeelint: disable=max_line_length
    uiLangsMenu=(_.extend(k,{active:k.langCode==activeLang,langCode:k.langCode or k.countryCode}) for k in uiLanguages)
    console.log(uiLangsMenu,activeLang)
    tempFn {data:currentNav,uiLanguages:uiLangsMenu}
