/// <reference path="./vocab_models.ts"/>
/// <reference path="../base/slide_modals.ts"/>

import slides=require("../base/slide_modals")

declare var require, $, ko, _, webkitSpeechRecognition;
var tempFn:(path:string)=>(data)=>string = require("../localization/templating")
var cardTemp:(data:Ivocab.WordItem)=>string = tempFn("/views/apps/templates/vocab/card")
var modalTemp:(data)=>string = tempFn("/views/apps/templates/base/modal")
var vocabController:(data)=>string = tempFn("/views/apps/templates/vocab/vocab-controller")
var buttons:string = tempFn("/views/apps/templates/base/buttons")({})
var inputs = tempFn("/views/apps/templates/base/inputs")({})
var alternatives = tempFn("/views/apps/templates/vocab/card-options")

//TODO: make algorhithtm of multichoice better

class VocabItem extends slides.KnockoutSlide {
    data:Ivocab.WordItem;

    public showSolution() {

        $(".flip-div", this.el).addClass("flipper")
    }

    public wasCorrect() {
        this.dot.addClass("correct")
        this.showSolution();

        console.log("DO SOMETHING")
    }

    public wasWrong() {
        this.dot.addClass("wrong")
        this.showSolution();

        console.log("DO SOMETHING")

    }

    extensions(){
        return {frontControls:"",backControls:""}
    }
}

class VocabItemControls extends VocabItem {

    extensions() {
        var extensions = {
            frontControls: $.toString($(".flip-card", buttons)),
            backControls: $.toString($('.was-wrong,.was-correct', buttons))
        }
        return extensions
    }
}

class VocabItemInput extends VocabItem {
    userInput;

    extensions() {
        var extensions = {
            frontControls: $.toString($(".correct-live", inputs)),
            backControls: ""
        }
        return extensions
    }

    setup() {
        this.userInput = ko.observable("")
        this.userInput.subscribe((newVal)=>this.checkInput(newVal))
        //register event, when pressing 'Enter' means the user gives up and want so see the word
        $('input', this.el).on('keyup', (e) => e.which == 13 ? this.wasWrong() : null);
        super.setup()
    }

    public wasWrong() {
        super.wasWrong()
        var controller = $.one(".back .controls", this.el).append($(".was-wrong", buttons))

    }

    public wasCorrect() {
        super.wasCorrect()
        var controller = $.one(".back .controls", this.el).append($(".was-correct", buttons))
    }

    public checkInput(newVal:string) {
        if (newVal == this.data.target) {
            this.wasCorrect()
        }
    }
}

class OptionsProvider {

    constructor(public data) {

    }

    serveOptions(word) {
    }
}

class VocabOptions extends OptionsProvider {
    data:Ivocab.WordItem[]

    serveOptions(word) {
        function isOk(ar:Ivocab.WordItem[]) {
            return ar.filter((e)=>e.source === word).length
        }

        var sample = _.sample(this.data, 3)
        while (isOk(sample)) {
            sample = _.sample(this.data, 3)
        }
        return sample
    }
}

interface IVocabItemAlt extends Ivocab.WordItem {
    alternative:VocabOptions
}


class VocabItemMC extends VocabItem {
    dataProvider:VocabOptions;
    data:IVocabItemAlt;
    correctIx:number;

    setup() {
        var alts = _.shuffle(this.data.alternative.serveOptions(this.data.source).concat([this.data]))
        var tempData = alts.map((e)=>e.target)
        var temp = alternatives({options: tempData})
        this.correctIx = _.findIndex(alts, (e)=>e.source === this.data.source)
        $.one("#asked-item", this.el).after(temp)
        super.setup()
    }

    public markSelection(self, evt:Event) {
        var target = $(evt.target)
        $("li", this.el).removeClass("active")
        target.toggleClass("active")
        var ix = parseInt(target.data("value"))
        setTimeout(()=>{
        ix === this.correctIx ? this.wasCorrect() : this.wasWrong()
        this.showSolution()
        },400)
    }

    public wasWrong() {
        super.wasWrong()
        var controller = $.one(".back .controls", this.el).append($(".was-wrong", buttons))

    }

    public wasCorrect() {
        super.wasCorrect()
        var controller = $.one(".back .controls", this.el).append($(".was-correct", buttons))
    }
}

interface SpeechRecognition {
    continuous:boolean;
    interimResults:boolean;
    onstart:(evt)=>void;
    onresult;
    onerror;
    onend;
    start;
}

class VocabVoice extends VocabItem {

    // just a test; needs more work, there must be clearness about security since browser is listening
    recognition:SpeechRecognition;

    setup() {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onstart = this.onstart
        this.recognition.onresult = this.onresult
        this.recognition.onerror = this.onerror
        this.recognition.onend = this.onend

        super.setup()
    }

    extensions() {
        var extensions = {
            frontControls: $.toString($(".listen-user", buttons)),
            backControls: ""
        }
        console.log(extensions, "extensions")
        return extensions
    }

    private onstart() {

    }

    private onresult(event) {
        //console.log(evt.results[0],"evt.results[0]")
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                var res = event.results[i][0].transcript;
            } else {

                var res = event.results[i][0].transcript;
            }
            console.log(res, "res")
        }
    }

    private onerror(evt) {

    }

    private onend() {

    }

    startRecognition(self, evt) {
        this.recognition.start();

    }

}

// factory
var classMap = {
    "input": VocabItemInput,
    "self_control": VocabItemControls,
    "multi_choice": VocabItemMC
    //"voice_input":VocabVoice
}


export class VocabSession extends slides.ModalApp {
    alternativeProvider:VocabOptions;

    constructor(public container, public data:Ivocab.WordItem[]) {
        super(container, data)
        this.swipeOptions.onactivate = (newEl)=> {
            console.log(arguments);
            var newEL = arguments[0]
            //set little timeout until slide is accomplished, otherwise the element is focused half way
            setTimeout(()=>$("input", newEL).focus(), 300)
            return null
        }
        this.alternativeProvider = new VocabOptions(data)
        var temp = vocabController({})
        this.container.html(temp)
        ko.applyBindings(this, this.container[0])
        this.applyTooltips()
    }

    public startSession(type, self, evt) {
        // check if speech api is supported
        if (type === "voice_input" && (!('webkitSpeechRecognition' in window))) {
            alert("Your browser doesnt support this. User Chrome!")
            return null
        }

        var typeClass = classMap[type]
        this.slides = this.data.map((e, i)=> {
            // multi_choice should provide a further property containing the alternative provider instance
            var data = (type === "multi_choice" ? _.extend(e, {alternative: this.alternativeProvider}) : e)
            return new typeClass(this.container, cardTemp, data)
        })
        this.insertSlides(modalTemp)
        this.blockUI()

    }

}