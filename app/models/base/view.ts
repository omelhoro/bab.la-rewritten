declare var ko, $;

export class View {
  public templateData = {}; tempFn: (data) => string;
  constructor(public container, public opts = { mode: null, id: null, cont: '' }, public data = null) {
    this.setup()
    this.inserting()
    this.postInsert()
  }

  public setup() { }

  public inserting() {
    var temp = this.tempFn(this.templateData)
    this.container.html(temp)
  }

  public postInsert() {
    ko.applyBindings(this, this.container[0])
  }
}
