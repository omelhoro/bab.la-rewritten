declare var require, $, ko,_;

interface JQuery {
    addClass;
    removeClass;
}

export class Slide {
    el:Element;
    el$:JQuery;
    dot:JQuery;

    constructor(public container, public templateFn:(data)=>string, public data) {
        var temp = this.templateFn(_.extend(this.data,this.extensions()))
        this.el$ = $(temp)
        this.el = this.el$[0]

        this.setup()
    }

    public setup() {
    }

    public setDot(e:JQuery) {
        this.dot = e
    }

    //allows for putting custom elements to the template, which is rendered in constructor
    extensions(){return {}}

}

export class KnockoutSlide extends Slide {
    public setup() {
        ko.applyBindings(this, this.el)

    }

}

export class ModalApp {

    public slides:Slide[];mod;swipe;
    swipeOptions={
            autostart: false,
        onactivate:(arg)=>1
        }

    constructor(public container, public data) {
    }

    private _bootModal() {
        this.mod = $.one(".modal", this.container)

        //strange bug that '.modal-dialog' gives 0 on mobile devices, so we need to take the parent width
        var slideWidth = $(".modal-dialog", this.mod).width() || this.mod.width()-30
        //set the width, because modals need to hold the slide show
        $.one(".question-gallery", this.container).css("width", slideWidth)
        this.mod.on("shown.bs.modal", ()=> {
            this._renderSwipeShow(this.slides)
        })
        this.mod.modal({})
    }

    public blockUI():void {
        this._bootModal()
    }

    public insertSlides(tempFn,where=$("div.modal-container",this.container)):void {
        var temp=$(tempFn({}))
        this.slides.forEach((e:Slide)=>$("ul.slides", temp).append(e.el))
        where.html(temp)
        $("input, button",this.container).prop("tabindex","-1")

    }

    public applyTooltips(){
                $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }


    private _renderSwipeShow(quests:Slide[]) {
        this.swipe=$.one(".swipeshow", this.container).swipeshow(this.swipeOptions)
//TODO: there is a bug that slides positions are sometimes skewed; in longer slides and it may be related to dots
        $(".dot-item").each((i, e)=>quests[i].setDot($(e)))
    }
}