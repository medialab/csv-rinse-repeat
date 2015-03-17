'use strict';

angular.module('rerere.cards.topitems', [])

.factory('topitems', [
  function() {
    return function() {
      var ns = {}

      // Initalize stop words lists
      var en_stop_words = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your']
        , fr_stop_words = ['alors', 'au', 'aucuns', 'aussi', 'autre', 'avant', 'avec', 'avoir', 'bon', 'car', 'ce', 'cela', 'ces', 'ceux', 'chaque', 'ci', 'comme', 'comment', 'dans', 'des', 'du', 'dedans', 'dehors', 'depuis', 'devrait', 'doit', 'donc', 'dos', 'début', 'elle', 'elles', 'en', 'encore', 'essai', 'est', 'et', 'eu', 'fait', 'faites', 'fois', 'font', 'hors', 'ici', 'il', 'ils', 'je  juste', 'la', 'le', 'les', 'leur', 'là', 'ma', 'maintenant', 'mais', 'mes', 'mine', 'moins', 'mon', 'mot', 'même', 'ni', 'nommés', 'notre', 'nous', 'ou', 'où', 'par', 'parce', 'pas', 'peut', 'peu', 'plupart', 'pour', 'pourquoi', 'quand', 'que', 'quel', 'quelle', 'quelles', 'quels', 'qui', 'sa', 'sans', 'ses', 'seulement', 'si', 'sien', 'son', 'sont', 'sous', 'soyez sujet', 'sur', 'ta', 'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop', 'très', 'tu', 'voient', 'vont', 'votre', 'vous', 'vu', 'ça', 'étaient', 'état', 'étions', 'été', 'être']
        , web_stop_words = ['www', 'http', 'https', 'pdf', 'twitter']
        , stop_words_index = {}

      // Build stop words index
      en_stop_words
        .concat(fr_stop_words)
        .concat(web_stop_words)
        .forEach(function(w){
            stop_words_index[w] = true
          })

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
    }
  
}])
