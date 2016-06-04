declare var require, $, ko, _, Handlebars;

interface JQuery {
  addClass;
  removeClass;
}

export class Slide {
  el: Element;
  el$: JQuery;
  dot: JQuery;

  constructor(public container) {
  }

  public setDot(e: JQuery) {
    this.dot = e
  }

  public html(content: string) {
    this.container.html(content)
  }

  public getOne(sel: string) {
    return $(sel)
  }

  public getElement(): JQuery {
    return this.container
  }
}

export class Slideshow {

  public slides: Slide[];
  temp;
  swipe; mod;
  swipeOptions = {
    autostart: false,
    onactivate: (newEl, newIx) => null
  }

  constructor(public container, opts) {
    this.temp = opts.template || require('./default-slideshow')
    var slidesIx = _.range(0, opts.nSlides)
    this.container.html(this.temp({ slideIx: slidesIx }))
    this.slides = $('li.slide', this.container).toArray().map((e) => new Slide($(e)))
  }

  public start(ix = 0) {
    // debugger;
    this.swipe = $.one('.swipeshow', this.container).swipeshow(this.swipeOptions)
    // this.swipe.goTo(6)
    // debugger;
    // TODO: there is a bug that slides positions are sometimes skewed; in longer slides and it may be related to dots
    // $(".dot-item").each((i, e)=>this.slides[i].setDot($(e)))
  }
}
