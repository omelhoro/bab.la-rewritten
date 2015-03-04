View = require 'views/base/view'
memory= require 'models/memory/memory'
module.exports = class MemoryView extends View
  autoRender: true
  className: 'memory'
  template: $.tfn '/views/apps/templates/memory'


  render:()->
    super()
    memorySession=new memory.MemoryGame($.one("#app-container",@el))
