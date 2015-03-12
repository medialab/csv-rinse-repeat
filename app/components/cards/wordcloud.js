'use strict';

angular.module('rerere.cards.wordcloud', [])

.factory('wordcloud', [
  function() {
    return function() {
      var ns = {}

      ns.draw = function(container_id, column_id, table){
        $('#'+container_id)
          .html('&shy;<style>' + ns.css + '</style>') // Clean and inject CSS
          .append($('<div class="wordcloud"></div>'))

        
      }

      ns.css = "\
"

      return ns
    }
  
}])
