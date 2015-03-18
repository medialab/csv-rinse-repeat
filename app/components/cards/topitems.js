'use strict';

angular.module('rerere.cards.topitems', [])

.factory('topitems', [
  function() {
    var ns = {}

    // Function called to draw the interface
    ns.draw = function(container_id, column_id, table){

      // Clean the container
      $('#'+container_id)
        .html('&shy;<style>' + ns.css + '</style>')     // Inject CSS
        .append($('<div class="topitems"></div>'))

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

    ns.css = '\
.topitems{  \
font: 12px Roboto, sans-serif;  \
padding-top: 6px;  \
padding-bottom: 6px;  \
-webkit-column-count: 4; /* Chrome, Safari, Opera */  \
   -moz-column-count: 4; /* Firefox */  \
        column-count: 4;  \
} \
.topitems p{  \
margin: 3px; \
padding-left: 6px; \
} \
.topitems .text-muted{ \
color: #AAA; \
}'

    return ns
  
}])
