import slides = require('../base/slide_modals')
import slideshow = require('../base/slideshow')
import Ivocab = require('./vocab_models');

declare var require, $, ko, _, webkitSpeechRecognition;
var tempFn: (path: string) => (data) => string = require('../localization/templating')
var cardTemp: (data: Ivocab.WordItem) => string = $.tfn('/views/apps/templates/vocab/card')
var modalTemp: (data) => string = $.tfn('/views/apps/templates/base/modal')
var vocabController: (data) => string = $.tfn('/views/apps/templates/vocab/vocab-controller')
var buttons: string = tempFn('/views/apps/templates/base/buttons')({})
var inputs = tempFn('/views/apps/templates/base/inputs')({})
var alternatives = tempFn('/views/apps/templates/vocab/card-options')

// TODO: make algorhithtm of multichoice better

class VocabItem {
  el;

  // TODO: currently a nogo; container can be only a slide; should changed to something more abstract
  constructor(public container: slideshow.Slide, public data: Ivocab.WordItem, opts) {
    this.setup()
  }

  setup() {
    // debugger;
    this.el = this.container.getElement()
    this.container.html(this.contentBody())
  }
  contentBody(): string {
    return 'test'
  }

  public showSolution() {
    $('.flip-div', this.el).addClass('flipper')
  }

  public wasCorrect() {
    // this.dot.addClass('correct')
    // this.container.markRoght()
    this.showSolution();

    console.log('DO SOMETHING')
  }

  public wasWrong() {
    // this.container.markWrong()
    // addClass('wrong')
    this.showSolution();

    console.log('DO SOMETHING')

  }

  extensions() {
  }
}

class VocabItemControls extends VocabItem {

  contentBody() {
    var extensions = {
      frontControls: $.toString($('.flip-card', buttons)),
      backControls: $.toString($('.was-wrong,.was-correct', buttons))
    }
    var temp = cardTemp(_.extend({ data: this.data }, extensions || {}))
    return temp
    // this.container.html(temp)
  }
}

class VocabItemInput extends VocabItem {
  userInput;

  contentBody() {
    var extensions = {
      frontControls: $.toString($('.correct-live', inputs)),
      backControls: ''
    }
    var temp: string = cardTemp(_.extend({ data: this.data }, extensions || {}))
    return temp
  }

  setup() {
    super.setup()
    this.userInput = ko.observable('')
    this.userInput.subscribe((newVal) => this.checkInput(newVal))
    // register event, when pressing 'Enter' means the user gives up and want so see the word
    $('input', this.el).on('keyup', (e) => e.which === 13 ? this.wasWrong() : null);
  }

  public wasWrong() {
    super.wasWrong()
    var controller = $.one('.back .controls', this.el).append($('.was-wrong', buttons))

  }

  public wasCorrect() {
    super.wasCorrect()
    var controller = $.one('.back .controls', this.el).append($('.was-correct', buttons))
  }

  private checkInput(newVal: string) {
    if (newVal === this.data.target) {
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
  data: Ivocab.WordItem[]

  serveOptions(word) {
    function isOk(ar: Ivocab.WordItem[]) {
      return ar.filter((e) => e.source === word).length
    }

    var sample = _.sample(this.data, 3)
    while (isOk(sample)) {
      sample = _.sample(this.data, 3)
    }
    return sample
  }
}

interface IVocabItemAlt extends Ivocab.WordItem {
  alternative: VocabOptions
}


class VocabItemMC extends VocabItem {
  dataProvider: VocabOptions;
  data: IVocabItemAlt;
  correctIx: number;

  contentBody() {
    var extensions = {
      frontControls: '',
      backControls: ''
    }
    var temp = cardTemp(_.extend(this.data, extensions || {}))
    return temp
  }

  setup() {
    super.setup()
    var alts = _.shuffle(this.data.alternative.serveOptions(this.data.source).concat([this.data]))
    var tempData = alts.map((e) => e.target)
    var temp = alternatives({ options: tempData })
    this.correctIx = _.findIndex(alts, (e) => e.source === this.data.source)
    $.one('#asked-item', this.el).after(temp)
    ko.applyBindings(this, this.el[0])
  }

  public markSelection(self, evt: Event) {
    var target = $(evt.target)
    $('li', this.el).removeClass('active')
    target.toggleClass('active')
    var ix = parseInt(target.data('value'))
    setTimeout(() => {
      ix === this.correctIx ? this.wasCorrect() : this.wasWrong()
      this.showSolution()
    }, 400)
  }

  public wasWrong() {
    super.wasWrong()
    var controller = $.one('.back .controls', this.el).append($('.was-wrong', buttons))

  }

  public wasCorrect() {
    super.wasCorrect()
    var controller = $.one('.back .controls', this.el).append($('.was-correct', buttons))
  }
}

class TaskItemFactory {
  // factory
  static classMap = {
    'input': VocabItemInput,
    'self_control': VocabItemControls,
    'multi_choice': VocabItemMC
    // 'voice_input':VocabVoice
  }

  static createClass(type, container, data, opts = {}) {
    return new TaskItemFactory.classMap[type](container, data, opts)
  }
}

class TaskApp {

  constructor(public container, public data, public opts) {
  }

  public prepare() { }

  public persist() { }

  public start() { }

  public next() { }

  public nth(i) { }

  public pause() { }
}

export class VocabAppSlide extends TaskApp {
  slideShow: slideshow.Slideshow;
  opts: { taskType: string; slideOpts };
  vocabItems: VocabItem[];
  data: Ivocab.WordItem[]
  alternativeProvider: VocabOptions;

  prepare() {
    var slideDiv = $('<div id="slideshow-container">')
    this.alternativeProvider = new VocabOptions(this.data)
    this.container.html(slideDiv)
    this.slideShow = new slideshow.Slideshow(slideDiv, { nSlides: this.data.length })
    this.vocabItems = this.slideShow.slides.map((e: slideshow.Slide, i) => {
      var type = this.opts.taskType || 'multi_choice'
      var data = (type === 'multi_choice' ? _.extend(this.data[i], { alternative: this.alternativeProvider }) : this.data[i])
      return TaskItemFactory.createClass(type, e, data, {})
    })
    this.slideShow.swipeOptions.onactivate = (newEl, newIx: number) => {
      // update the counter and currentIx
      $('.counter', this.container).text((newIx + 1).toString() + '/' + this.vocabItems.length)
      $('.current-slide', this.container).val(newIx + 1)
      // set little timeout until slide is accomplished, otherwise the element is focused half way
      setTimeout(() => $('input', newEl).focus(), 300)
    }
    this.slideShow.start()
  }

}

export class VocabSession extends slides.ModalApp {
  alternativeProvider: VocabOptions;

  constructor(public container, public data: Ivocab.WordItem[]) {
    super(container, data)
    this.swipeOptions.onactivate = (newEl) => {
      // set little timeout until slide is
      // accomplished, otherwise the element is focused half way
      setTimeout(() => $('input', newEl).focus(), 300)
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
    if (type === 'voice_input' && (!('webkitSpeechRecognition' in window))) {
      alert('Your browser doesnt support this. Use Chrome!')
      return null
    }

    // var typeClass = classMap[type]
    this.slides = this.data.map((e, i) => {
      // multi_choice should provide a further property containing the alternative provider instance
      var data = (type === 'multi_choice' ? _.extend(e, { alternative: this.alternativeProvider }) : e)
      return TaskItemFactory.createClass(type, this.container, cardTemp, data)
    })
    this.insertSlides(modalTemp)
    this.blockUI()

  }

}
