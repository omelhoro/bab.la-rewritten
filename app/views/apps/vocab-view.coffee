View = require 'views/base/view'
vocab=require 'models/vocab/vocab'
vocabDb=require 'models/vocab/vocab_db'

module.exports = class VocabView extends View
  autoRender: true
  className: 'vocab'
  template: $.tfn '/views/apps/templates/vocab'

  render:()->
    linkAr=(@_makeObject(k,v,(nm)->"/vocab/#{nm}") for k,v of vocabDb)
    @.model=new Chaplin.Model({sublinks:linkAr,title:"Vocabulary-Game"})
    super()
    if @taskId
      Promise.resolve($.getJSON("/static/vocab/#{@taskId}.json"))
      .then((data)=>
        # remap object of k,v to array of objects with k in v
        data=(_.extend(v,{id:k},{source:v[1],target:v[2]}) for k,v of data)
        taskItem=new vocab.VocabSession($("#app-container",@.el),data)
      )
