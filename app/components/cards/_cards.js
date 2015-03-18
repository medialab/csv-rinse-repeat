'use strict';

angular.module('rerere.cards', [

    'rerere.cards.calendarview'
  , 'rerere.cards.wordcloud'
  , 'rerere.cards.topwords'
  , 'rerere.cards.topitems'
  , 'rerere.cards.volumeovertime_day'

])

.factory('cards', ['calendarview', 'wordcloud', 'topwords', 'topitems', 'volumeovertime_day'
  ,function(        calendarview ,  wordcloud ,  topwords ,  topitems ,  volumeovertime_day ) {
    var ns = {}

    ns.calendarview = calendarview
    ns.wordcloud = wordcloud
    ns.topwords = topwords
    ns.topitems = topitems
    ns.volumeovertime_day = volumeovertime_day

    return ns
  }
])



