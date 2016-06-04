$.one=(sel,con)->
  result=$(sel,con)
  if result.length!=1
    throw new Error """The selector #{sel} on
      container #{con} yielded #{result.length} elements"""
  else
    return result

$.toString=(el)->
  $('<div>').append(el).html()

  # utility to group elements in jquery
  # according to function or to data attributes
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
      #TODO: its a simple parser, too
      #simple( wont work when commas are in a field
      csv=(row.split(",") for row in data.split("\n"))
      toDict=(a,e)->
        a[e[0]]=_.object(([csv[0][i],val] for val,i in e))
        a
      map=csv.slice(1).reduce(toDict,{})
      window.uiData=map
      res(window.uiData)
      )
    )

$.tfn=(path)->
  require(path)

$.afPath=(path)->
  if ((window.origPath.indexOf("http-service")>-1) or
      location.href.indexOf("3333")==-1) and path.indexOf(window.origPath)==-1
    newPath = window.origPath + path
    console.log(newPath, "newPath")
    console.log(
      path.indexOf(window.origPath)==-1,"path.indexOf(window.origPath)==-1")
    return newPath
  else
    return path
