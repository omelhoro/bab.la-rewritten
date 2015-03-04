
declare var require, $, _, ko, Promise, d3;

var wordsDb:string[] = require("./words_db")
var tempFn:(path)=>(data)=>string = require("../localization/templating")
var checkInput:(lang:string)=>(letter:string)=>boolean=require("../localization/keyboards")

interface Movement{
    sel:string;
    effect:string;
}

var hangmanElementOrder:Movement[] = [
{sel:"#fundament",effect:"bringin"},
    {sel:"#balken",effect:"bringin"},
    {sel:"#rope",effect:"bringin"},
    //{sel:"#head",effect:"bringin"},
    {sel:"#chair",effect:"bringin"},
    {sel:"#human",effect:"bringin"},
    //{sel:"#torso",effect:"bringin"},
    //{sel:"#legs",effect:"bringin"},
    {sel:"#strick",effect:"bringin"},
    //{sel:"#strick",effect:"tighten"},
    {sel:"#chair",effect:"remove"},
    //{sel:"#head",effect:"dropDown"}
    //{sel:"#head",effect:"tilt"}
]

class SvgAnimation {
    animations;

    constructor(public svg,animations:Movement[]) {
        this.animations=animations.map((e)=>()=>this[e.effect](this.svg.select(e.sel)))
    }


    public serveEffect() {
        console.log("Give a nice Svg-effect back")
    }
}


class SvgAnimationHangman extends SvgAnimation{



    public pushItem(i){
this.animations[i]()
    }

        private bringin(el):void{
            console.log(el,"el")
            el.transition().duration(1000).attr({
            transform: function(e){return d3.select(this).attr("data-transform")},
            opacity:1
        })
    }

    private remove(el) {
        el.transition().duration(1000).attr({
            transform: "translate(500,500)"
        })
    }

    private dropDown(el){
        el.transition().duration(1000).attr({
            transform: "translate(20,0)"
        })
    }
}

class Controller {

    constructor(public container) {

    }

}

class Panel {
    path:string;
    tempFn:(data)=>string;
    data;

    constructor(public container) {
        this.setup()
    }

    public setup() {
        this.tempFn = tempFn(this.path)
        var temp = this.tempFn({data: this.data})
        this.container.html(temp)
        ko.applyBindings(this, this.container.children()[0])
    }
}

class LetterPanel extends Panel {
    data:string[];
    public lettersTried;
    curTarget;
    userLetter;
    letterElements;checkFn:(letter:string)=>boolean

    constructor(container) {
        this.path = "/views/apps/templates/hangman/letter-panel"
        this.checkFn=checkInput("en")
        this.data = _.range(97, 123).map((e)=>String.fromCharCode(e))
        this.lettersTried = ko.observable("")
        this.userLetter = ko.observable("")
        this.userLetter.subscribe((newVal)=>this.addLetter(newVal))
        super(container)
        this.letterElements = $.groupBy($(".letter-item", this.container),"letter")
    }

    public addLetter(newVal) {
        this.userLetter("")
        this._addToHistory(newVal)
    }

    private _addToHistory(letter) {
        // only add if the letter is not in the history
        if (this.lettersTried().indexOf(letter)==-1 && this.checkFn(letter)){
        var pre = this.lettersTried()
        this.lettersTried(pre + letter.toLowerCase())
        }
    }

    public userLetterList(self, evt) {
        var target = $(evt.target)
        var letIx = target.data("ix")
        this.curTarget = target.parent()
        this._addToHistory(this.data[letIx])
    }

    public markError(val:string) {
        console.log(val, this.letterElements)
        this.letterElements[val].map((e)=>e.addClass("wrong"))
    }

    public markRight(val:string) {
        this.letterElements[val].map((e)=>e.addClass("correct"))

    }

}

class WordPanel extends Panel {
    data:string[];letterElements;uncoveredHistory:string[];

    constructor(container, data) {
        //TODO:it works only with alphabetic letters; space, dash will lead to errors
        this.path = "/views/apps/templates/hangman/word-panel"
        this.data = data
        super(container)
        this.uncoveredHistory=[]
        this.letterElements=$.groupBy($("li.hidden-letter",this.container),"solution")
        console.log(this.letterElements)
    }

    public uncoverLetter(letter:string):boolean {
        this.letterElements[letter].map((e$)=>e$.text(letter))
        this.uncoveredHistory.push(letter)
        // returns whether all letters are uncovered
        return this.uncoveredHistory.length===Object.keys(this.letterElements).length
    }

}

class HangmanSvgPanel extends Panel {
    svg;
    svgParts;
    curIx:number;svgEffect:SvgAnimationHangman;

    constructor(container) {
        this.path = "/views/apps/templates/hangman/svg-panel"
        this.data = {}
        var imgPromise=Promise.resolve($.get("/images/hangman/hangman.svg"))
        imgPromise.then((xml)=> {
            console.log(xml,"xml")
            var importedNode = document.importNode(xml.documentElement, true);
            this.container[0].appendChild(importedNode)
            this._startSvg(importedNode)
        })
        this.curIx = 0
        super(container)
    }

    private _startSvg(node) {
        var serveRandom = (n)=>Math.random() < 0.5 ? n : -n
        this.svg = d3.select(node)
                this.svgEffect=new SvgAnimationHangman(this.svg,hangmanElementOrder)
        // get the width for pushing elements out of svg
        var svgWidth = this.svg.attr("width")
        console.log(this.svg,"this.svg")
        this.svgParts = hangmanElementOrder.map((e)=>this.svg.select(e.sel))
        console.log(this.svgParts,"this.svgParts")
        this.svgParts.map((e)=>console.log(e.attr("transform")))
        this.svgParts.map((e)=>e.transition().duration(1000).attr({
            // save the earlier transform for bringing it back later
            "data-transform":function(e){return d3.select(this).attr("transform")},
            transform:"translate(" + serveRandom(svgWidth) + "," + serveRandom(svgWidth) + ")",
            opacity:0.1,
        }))
    }

    public pushElement():boolean {
        this.svgEffect.pushItem(this.curIx)
        this.curIx++
        return this.curIx===this.svgEffect.animations.length
    }
}

class Modal{
    constructor(){

    }

    public render(opts){

    }
}

class ResultsModal extends Modal{
    tempFn:(data)=>string;el;
    constructor(public data:{isCorrect:boolean;word:string},public controller:HangmanGame){
        super()
        // TODO: logically it makes sense to extract the modal from controller but technically not really (??)
        this.tempFn=tempFn("/views/apps/templates/hangman/result-modal")
    }

    public render(opts={}){
        this.el=$(this.tempFn(this.data))
        $("body").append(this.el)
        // controller should handle
        ko.applyBindings(this.controller,this.el[0])
        this.el.modal({})
    }
}

export class HangmanGame extends Controller{
    letterPanel:LetterPanel;
    currentWord:string[];
    wordPanel:WordPanel;modal;
    svgPanel:HangmanSvgPanel;tempModal;wordsHistory:string[][]=[];

    constructor(public container) {
        super(container)
        this.startSession()
    }

    public startSession(newWord=true){

        this.letterPanel = new LetterPanel($.one("#letter-panel", this.container))
        this.svgPanel = new HangmanSvgPanel($.one("#svg-panel", this.container))
        this.currentWord = newWord?(wordsDb[_.random(wordsDb.length) - 1] || wordsDb[0]).split(""):this.wordsHistory.slice(-1)[0]
        console.log(this.currentWord)
        this.wordPanel = new WordPanel($.one("#word-panel", this.container), this.currentWord)
        this.letterPanel.lettersTried.subscribe((newVal:string)=>this.evalInput(newVal.slice(-1)))
    }

    public evalInput(val:string) {
        var isThere:boolean=this.currentWord.indexOf(val)>-1
        if (isThere) {
                        this.letterPanel.markRight(val)
            var isEnd=this.wordPanel.uncoverLetter(val)
            isEnd?this.showResult(true):null
        }
        else {
            this.letterPanel.markError(val)
            var isEnd=this.svgPanel.pushElement()
            isEnd?this.showResult(false):null
        }
    }

    public showResult(isCorrect){

        this.wordsHistory.push(this.currentWord)
        this.modal=new ResultsModal({isCorrect:isCorrect,word:this.currentWord.join("")},this)
        this.modal.render()
    }

    public restart(){
        this.startSession(false)
        this.modal.el.remove()
    }

    public tryNew(){
        this.startSession(true)
        this.modal.el.remove()
    }
}

// may be later used as CDN to not include d3 which is used only in hangman
function testD3(){
    var s = document.createElement("script");
s.src="//cdn.jsdelivr.net/d3js/3.5.5/d3.min.js"
if(s.addEventListener) {
  s.addEventListener("load",callback,false);
}
else if(s.readyState) {
  s.onreadystatechange = callback;
}
document.body.appendChild(s);
function callback() { console.log("loaded"); }
}
//testD3()