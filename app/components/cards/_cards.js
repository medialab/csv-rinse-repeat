'use strict';

// The list below contains a string identifier for each card type.
// The same string is used in the file name, module name and factory name.
// The goal here is just to make adding cards easier.

var cardlist = 
[ 'topitems'
, 'wordcloud'
, 'topwords'
, 'volumeovertime_day'
, 'calendarview'
, 'mapcoordinates'
]

angular.module('rerere.cards', cardlist.map(function(c){return 'rerere.cards.' + c}))

.factory('cards', cardlist.concat(function(){
  var ns = {}

  for(var i in arguments){
    var card = arguments[i]
    card.id = cardlist[i]
    card.imageSource = card.imageSource || 'components/cards/' + card.id + '.png'
    ns[cardlist[i]] = card
  }

  ns.cardsList = cardlist.map(function(d){
    return ns[d]
  })

  return ns
}))
