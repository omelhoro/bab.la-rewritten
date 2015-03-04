Application = require 'application'
routes = require 'routes'
tempFn=require("/models/localization/templating")

# Initialize the application on DOM ready event.
$ ->
  Handlebars.registerPartial("sidebar", require("/views/apps/templates/base/sidebar"))
  # a little function for jQuery to select only one and throw error otherwise; something like assert length==1
  $.one=(sel,con)->
    result=$(sel,con)
    if result.length!=1
      throw "The selector #{sel} on container #{con} yielded #{result.length} elements"
    else
      return result

  $.toString=(el)->
    $('<div>').append(el).html()
    
  # utility to group elements in jquery according to function or to data attributes
  $.groupBy=(jQuery,selector)->
    result={}
    if typeof(selector) =="function"
      fn=selector
    else
      fn=(e)->e.data(selector)
    for e in jQuery
      e$=$(e)
      key=fn(e$)
      if result[key] then result[key].push(e$) else result[key]=[e$]
    result

  $.getLocale=(lang,fallback)->
    newLang=Promise.resolve($.get("/static/translation.csv"))
    new Promise((res,rej)->
      newLang.then((data)->
        #TODO: its a simple parser, too simple( wont work when commas are in a field
        csv=(row.split(",") for row in data.split("\n"))
        toDict=(a,e)->
          a[e[0]]=_.object(([csv[0][i],val] for val,i in e))
          a
        map=csv.slice(1).reduce(toDict,{})
        window.uiData=map
        res(window.uiData)
        )
      )

  $.tfn=tempFn

  window.App=new Application {
    title: 'Brunch example application',
    controllerSuffix: '-controller',
    routes
  }