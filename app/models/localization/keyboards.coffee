db={
  en:()->
    caps=_.range(65,92).concat(_.range(97,123)).map((i)->String.fromCharCode(i))
}

checkAlphaRange=(lang)->
  if not lang of db
    console.log("#{lang} is not in the DB. Falling back on english")
    lang="en"
  validLetters=db[lang]()
  (letter)-> letter in validLetters
module.exports=checkAlphaRange