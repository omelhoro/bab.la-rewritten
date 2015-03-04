View = require 'views/base/view'
hangman=require 'models/hangman/hangman'

module.exports = class HangmanView extends View
  autoRender: true
  className: 'hangman'
  template: $.tfn '/views/apps/templates/hangman'


  render:()=>
    super()
    hangmanSession=new hangman.HangmanGame($.one("#app-container",@el))
