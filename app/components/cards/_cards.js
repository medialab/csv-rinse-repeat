'use strict';

// The list below contains a string identifier for each card type.
// The same string is used in the file name, module name and factory name.
// The goal here is just to make adding cards easier.

var cardlist = 
[ 'calendarview'
, 'wordcloud'
, 'topwords'
, 'topitems'
, 'volumeovertime_day'
, 'mapcoordinates'
]

angular.module('rerere.cards', cardlist.map(function(c){return 'rerere.cards.' + c}))

.factory('cards', cardlist.concat(function(){
  var ns = {}

  for(let i in arguments){
    ns[cardlist[i]] = arguments[i]
  }

  return ns
}))
