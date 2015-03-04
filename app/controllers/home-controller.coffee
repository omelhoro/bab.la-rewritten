Controller = require 'controllers/base/controller'
HeaderView = require 'views/home/header-view'
HomePageView = require 'views/home/home-page-view'
HangmanView = require 'views/apps/hangman-view'
QuizView = require 'views/apps/quiz-view'
VocabView = require 'views/apps/vocab-view'
MemoryView = require 'views/apps/memory-view'


module.exports = class HomeController extends Controller

  index: ->
    @view = new HomePageView region: 'main'

  hangman: ->
    console.log(arguments,"arguments")
    @view = new HangmanView region: 'main'

  quiz: (idObj) ->
    @view = new QuizView region: 'main',taskId:idObj.id

  vocab: (idObj) ->
    console.log(arguments,"arguments")
    @view = new VocabView region: 'main',taskId:idObj.id

  memory:->
    @view = new MemoryView region: 'main'

  notFound:->
    console.log(arguments,"NOT_FOUND")