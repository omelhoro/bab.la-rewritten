declare var require, _, ko, $, Promise;

var DB = require("./memory_db")
var uiLangs = require("../localization/ui_langs")

var tempFn:(path:string)=>(data)=>string = require("../localization/templating")
var tableTemp = tempFn("/views/apps/templates/memory/cards-layout")
var cardTemp = tempFn("/views/apps/templates/memory/card")


//TODO: make layout depending on number of languages: 3 langs -> 3 colunms; 2 langs -> 4 columns
//TODO: layout should be resizable (for mobile devices), currently it isnt

class Card {
    el;
    public isFlipped;

    constructor(public data:WordItem) {
        this.isFlipped = ko.observable(false)
    }

    public setElement(el) {
        this.el = el
        var obj:{countryCode;langFlag} = _.findWhere(uiLangs, {countryCode: this.data.lang}) || _.findWhere(uiLangs, {langCode: this.data.lang})
        var temp = cardTemp(_.extend(this.data, {langIcon: obj.langFlag}))
        this.el.html(temp)
        ko.applyBindings(this, el[0])
    }

    private flipCard() {
        // flip only if it's not flipped, else log simply
        !this.isFlipped() ? this.isFlipped(true) : console.log("already clicked")
    }

    public markFalse() {
        this.el.addClass("false")

        // remove the false class after some time, that user can see his mistake
        setTimeout(()=> {
            this.el.removeClass("false")
            this.isFlipped(false)
        }, 1500)
    }

    public markCorrect() {
        this.el.addClass("correct")

    }

}

class CardPair {
    cards:Card[];
    public selected;

    constructor(public data:WordItem[]) {
        this.cards = this.data.map((e)=>new Card(e))
        this.selected = ko.observableArray([])
        this.cards.forEach((e)=>e.isFlipped.subscribe((val)=>val ? this.makeSelected(e) : null))
    }

    private makeSelected(el:Card) {
        // add one before pushing the element
        this.selected.push(el)
    }

    public markFalse() {
        this.selected().map((e:Card)=>e.markFalse())
        this.selected.removeAll()
    }

    public toString() {
        return this.cards.map((e)=>e.data.word).join(" ")
    }

    public isComplete() {
        var result = this.selected().length === this.cards.length
        result ? this.cards.map((e)=>e.markCorrect()) : null
        return result
    }


}

class Options {
    constructor(public container, tempFn = null) {
        this.setup()
    }

    setup() {

    }
}

interface IMemoryOptions {
    nPairs:number; // number of pairs
    maxColumns:number; // number of columns
    langs:()=> string[]; // chosen languages like 'de', 'en', but in a function, that checks the observables on call
}

var testLangs = [
    {lang: "ru", langName: "Русский"},
    {lang: "en", langName: "English"},
    {lang: "de", langName: "Deutsch"},
    {lang: "", langName: "None"}
]

class MemoryOptions extends Options implements IMemoryOptions {
    nPairs:number;
    maxColumns:number;
    langs:()=> string[];
    tempFn;
    el$;
    el;
    availableLanguages;
    firstLang;
    secondLang;
    thirdLang;
    selectedLangs;
    nWords;

    setup() {
        this.tempFn = tempFn("/views/apps/templates/memory/options")
        var temp = this.tempFn({})
        this.setOps()
        this.el$ = $(temp)
        this.el = this.el$[0]
        this.container.html(this.el$)
        ko.applyBindings(this, this.el)
    }


    public setOps() {
        this.availableLanguages = testLangs
        this.firstLang = ko.observable(this.availableLanguages[0])
        this.secondLang = ko.observable(this.availableLanguages[1])
        // third language is not default
        this.thirdLang = ko.observable(this.availableLanguages.slice(-1)[0])
        this.selectedLangs = [this.firstLang, this.secondLang, this.thirdLang]

        this.nWords = ko.observable(4)
        this.maxColumns = 3
        //function that gets always the newest value of selected langs
        this.langs = ()=> this.selectedLangs.map((e)=>e()['lang']).filter(Boolean)
    }

}

interface WordItem {
    lang:string; // language
    word:string; // the word
}

class DBAdapter {

}

class MemoryDb extends DBAdapter {

    static loadDb() {
        var db = Promise.resolve($.getJSON("/static/memory/swadesh.json"))
        return db.then((data)=>{
            return new MemoryDb(data)
        })
    }


    constructor(public data){
        super()
    }


    serveData(n) {
        return new Promise((resolve, reject)=> {
            var opts = _.sample(this.data, n)
            resolve(opts)
        })
    }

}

export class MemoryGame {
    currentSubset;
    pairs:CardPair[];
    cards:Card[];
    currentPair:CardPair;
    opts:MemoryOptions;
    db:MemoryDb;

    constructor(public container) {
        this.opts = new MemoryOptions($("#options", this.container))
        //listen to options changings and start new game, which parses the new options
        this.opts.selectedLangs.map((e)=>e.subscribe((newVal)=>this.startNewGame()))
        this.opts.nWords.subscribe((newVal)=>this.startNewGame())
        MemoryDb.loadDb().then((db)=>{
            this.db = db
            // when db connection is ready start new game
            this.startNewGame()
        })
    }

    private chooseLayout() {
        // options of column numbers, the function computes the free cells and chooses the one with the least
        var opts = [3, 4, 5, 6]
        var nCards = this.cards.length
        var res = opts.map(function (e) {
            var rest = nCards % e
            var rows = !rest ? nCards / e : (Math.floor(nCards / e) + 1)
            return {rows: rows, free: rest ? e - rest : 0, columns: e}
        })
        // choose from a specific number a layout which goes into columns if there are alternatives
        var sorted = _.sortBy(res, (e)=> e.free)
        // when more on cards on desk than choose the layout with most columns
        if (nCards > 8) {
            // number for which to look as alternative
            var freeFirst = sorted[0].free
            var allAlts = sorted.filter((e)=>e.free == freeFirst)
            // sort in reversed order and take the layoyt with most columns
            return _.sortBy(allAlts, (e)=>-e.columns)[0]
        }
        else {
            return sorted[0]
        }
    }

    private renderLayout(){
        // render the word object to pairs according to languages chosen
        var pairs:WordItem[][] = this.currentSubset.map((pair)=>this.opts.langs().map((lang)=> {
            return {lang: lang, word: pair[lang]}
        }))
        this.pairs = []
        this.cards = []
        pairs.forEach((e)=> {
            var pair = new CardPair(e)
            this.pairs.push(pair)
            this.cards = this.cards.concat(pair.cards)
        })

        // render and insert template
        var layout = this.chooseLayout()
        //var nColumns=this.cards.length %2 ===0? 4: (this.cards.length % 3 ===0? 3:4)
        //var rows=Math.floor(this.cards.length/nColumns)+this.cards.length%nColumns
        var data = {rows: _.range(0, layout.rows), columns: _.range(0, layout.columns)}
        var temp = tableTemp(data)
        var appLayout = $.one("#app", this.container).html($(temp))

        // shuffle the order for binding with td-elements
        this.cards = _.shuffle(this.cards)
        $("td", appLayout).each((i, e)=>i < this.cards.length ? this.cards[i].setElement($(e)) : null)

        // watch to see if selection goes beyond the pairs, so the choice is false then
        this.pairs.forEach((e)=>e.selected.subscribe((newVal)=>newVal.length > 0 ? this.checkUserGuess(e) : null))

    }

    public startNewGame() {
        this.db.serveData(this.opts.nWords()).then((data)=>{
            console.log(data,"data")
            this.currentSubset=data
            this.renderLayout()
        })
    }

    public checkUserGuess(x:CardPair) {
        // if pair is already set, check if the click was within the same pair, otherwise false
        if (this.currentPair) {
            if (x === this.currentPair) {
                var pairIsComplete:boolean = this.isComplete()
                this.currentPair = pairIsComplete ? null : this.currentPair
            }
            else {
                this.isFalse([this.currentPair, x])
                this.currentPair = null
            }
        }

        // set pair as current if no exists
        else {
            this.currentPair = x
        }
    }

    public isComplete():boolean {
        var result:boolean = this.currentPair.isComplete()
        return result
    }

    public isFalse(toFalsify:CardPair[]) {
        toFalsify.map((e)=>e.markFalse())
    }
}