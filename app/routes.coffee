# Application routes.
module.exports = (match) ->
  match '', 'home#index'
  match "index",'home#index'
  match 'hangman', 'home#hangman'
  match 'quiz', 'home#quiz'
  match 'quiz/:id', 'home#quiz'
  match 'vocab', 'home#vocab'
  match 'vocab/:id', 'home#vocab'
  match 'memory','home#memory'
  match '*notFound','home#notFound'

