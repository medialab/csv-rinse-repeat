'use strict';

angular.module('rerere.cards.volumeovertime_day', [])

.factory('volumeovertime_day', [
  function() {
    return function() {
      var ns = {}

      // Function called to draw the interface
      ns.draw = function(container_id, column_id, table){

        // Clean the container
        $('#'+container_id)
          .html('')

        // TODO...

        // Initialize various variables
        var items = table.map(function(d){
                return ''+d[column_id]                    // Extract text from the right column
              })
          , width = $('#'+container_id).width()           // We cannot set width (comes from the framing UI)
          , height = 260                                  // But we can set height

        // Set container's height
        $('#'+container_id).height(height)

        // Tokenize and index the words
        var itemsMap = d3.map()                           // A d3 map works like an index object (key-value pairs)
        items.forEach(function(item){
          itemsMap.set(item, (itemsMap.get(item) || 0) + 1 )
        })

        // Convert the itemsMap into a list of objects compliant with wordcloud
        var words = itemsMap.entries()                    // Return a list of {key:key, value:value} objects
          .map(function(entry){
              return {                                    // Renaming necessary for word cloud plugin
                  text:  entry.key
                , count: entry.value
                }
            })
          .sort(function(a,b){                            // Sort by count
              return b.count-a.count
            })
          .filter(function(d, i){
              return i<50                                 // Keep the first items (= highest count)
            })

        // Draw (html)
        var p = d3.select('#'+container_id + ' .topitems').selectAll("p")
            .data(words)
          .enter().append("p")
            // .attr("width", width)
            // .attr("height", height)
            .html(function(d, i){
                return '<span class="text-info">' + (i+1) + '. </span>' + d.text + ' <span class="text-muted">('+d.count+')</span>'
              })
      }

      return ns
    }
  
}])
