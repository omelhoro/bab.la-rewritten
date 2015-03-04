/// <reference path="./quiz_models.ts"/>
/// <reference path="../base/slide_modals.ts"/>

declare var require, $, ko;

import slides=require("../base/slide_modals")

interface JQuery {
    addClass;
    removeClass;
}

var tempFn:(path:string)=>(data)=>string=require("../localization/templating")

var questionTemp:(data)=>string = tempFn("views/apps/templates/base/modal")
var questionController:(data)=>string = tempFn("views/apps/templates/quiz/quiz-controller")
var questionItem:(data)=>string = tempFn("views/apps/templates/quiz/question-item")
var quizIntro:(data)=>string = tempFn("views/apps/templates/quiz/quiz-intro")
var quizOutro:(data)=>string = tempFn("views/apps/templates/quiz/quiz-outro")



class Question extends slides.KnockoutSlide {
    public isCorrect:boolean = false;

}


class Intro extends slides.KnockoutSlide {

}

class Outro extends slides.KnockoutSlide {
    controlItems:QuizQuestion[];


    public setItem(data:QuizQuestion[]){
        this.controlItems=data
    }

    public showResults(){
        var res=this.controlItems.map((e)=>{
            e.checkStatus()
            return e.isCorrect
        })
        var nCorrect=res.filter(Boolean).length
        var rescss=$(".progress-bar",this.el).css("width",((nCorrect/res.length)*100)+"%")
        console.log(rescss)
    }


}

class QuizQuestion extends Question {
    public data:Iquiz.QQuestion;
    activeChoice;

    public checkStatus(){
        var newClass = this.isCorrect ? ["correct", "wrong"] : ["wrong", "correct"]
        this.dot.removeClass(newClass[1]).addClass(newClass[0])
    }

    public markSelection(self, evt:Event) {
        var target = $(evt.target)
        $("li", this.container).removeClass("active")
        target.toggleClass("active")
        this.isCorrect = target.data("value") == this.data.qCorrectAns
        console.log(target.val(), target,this.isCorrect,this.data.qCorrectAns)

    }



}

export class Quiz extends slides.ModalApp{
    public questions:Iquiz.QQuestion[];

    constructor(public container, public data:Iquiz.Quiz) {
        super(container,data)
        this.questions =<Iquiz.QQuestion[]>data.qQuestions
        var temp=$(questionController({}))
        this.container.html(temp)
                ko.applyBindings(this, this.container[0])
this.applyTooltips()
    }

    public startSession() {
        this.slides= this.questions.map((e, i)=>new QuizQuestion(this.container, questionItem, e))
        this.slides.unshift(new Intro(this.container, quizIntro, this.data))
        var outro=new Outro(this.container, quizOutro, this.data)
        var a:QuizQuestion[]=<QuizQuestion[]>this.slides.slice(1)
        outro.setItem(a)
        this.slides.push(outro)
        this.insertSlides(questionTemp)
        this.blockUI()
    }
}