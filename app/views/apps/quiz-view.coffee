View = require 'views/base/view'
quiz=require 'models/quiz/quiz'
quizDb=require 'models/quiz/quiz_db'

module.exports = class QuizView extends View
  autoRender: true
  className: 'Iquiz'
  template: $.tfn '/views/apps/templates/quiz'
  optionNames: View::optionNames.concat ['taskId']

  render:()->
    linkAr=(@_makeObject(k,v,(nm)->"/quiz/#{nm}") for k,v of quizDb)
    @.model=new Chaplin.Model({sublinks:linkAr,title:"Quiz-Game"})
    super()
    if @taskId
      ajaxPromise=Promise.resolve($.getJSON("/static/quiz/#{@.taskId}.json"))
      ajaxPromise.then((data)=>
        data[0].imagePath="/images/quiz/#{@.taskId}.jpg"
        console.log(this.el,data,"this.el")
        quizItem=new quiz.Quiz($("#app-container",@.el),data[0])
      )
