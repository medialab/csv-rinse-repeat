'use strict';

angular.module('rerere.cards', [

  // Declare cards a first time here (modules)
    'rerere.cards.calendarview'
  , 'rerere.cards.wordcloud'
  , 'rerere.cards.topwords'
  , 'rerere.cards.topitems'

])

// Declare cards a second time in the lines below (lazy loading)
.factory('cards', ['calendarview', 'wordcloud', 'topwords', 'topitems'
  ,function(        calendarview ,  wordcloud ,  topwords ,  topitems ) {
    var ns = {}

    // Declare cards a third and last time below (factories)
    ns.calendarview = calendarview
    ns.wordcloud = wordcloud
    ns.topwords = topwords
    ns.topitems = topitems

    return ns
  }
])



