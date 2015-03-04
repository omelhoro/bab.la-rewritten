require 'lib/view-helper' # Just load the view helpers, no return value

module.exports = class View extends Chaplin.View
  # Auto-save `template` option passed to any view as `@template`.
  optionNames: Chaplin.View::optionNames.concat ['template',"taskId"]

  # Precompiled templates function initializer.
  getTemplateFunction: ->
    @template

  _capitaliseFirstLetter: (string)->
      string.charAt(0).toUpperCase() + string.slice(1);

  _makeObject:(k,v,fn)=>
      normalName=k.replace(".json","")
      userFriendly=normalName.split("_").map(@_capitaliseFirstLetter).join(" ")
      obj={name:userFriendly,link:fn(normalName),active:@.taskId==normalName}
      _.extend(obj,v)
