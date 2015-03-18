'use strict';

angular.module('rerere.cards.wordcloud', [])

.factory('wordcloud', [
  function() {
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
        .html('')

      // Initialize various variables
      var strings = table.map(function(d){
              return ''+d[column_id]                    // Extract text from the right column
            })
        , width = $('#'+container_id).width()           // We cannot set width (comes from the framing UI)
        , height = 300                                  // But we can set height
        , fill = d3.scale.category20()                  // Construct a new ordinal scale with a range of 20 categorical colors

      // Set container's height
      $('#'+container_id).height(height)

      // Tokenize and index the words
      var wordsMap = d3.map()                           // A d3 map works like an index object (key-value pairs)
      strings.forEach(function(string){
        var words = string
          .toLowerCase()
          .replace(/http[^ ]*/gi, '')                   // Remove URLs from text
          .match(/[^\s\.,!?:\/'"]+/g)                   // Tokenize text into words

        words = words || []
        
        words.forEach(function(w){
          if(wordIsValid_cheap(w))
            wordsMap.set(w, (wordsMap.get(w) || 0) + 1 )
        })
      })

      // Convert the wordsMap into a list of objects compliant with wordcloud
      var words = wordsMap.entries()                    // Return a list of {key:key, value:value} objects
        .map(function(entry){
            return {                                    // Renaming necessary for word cloud plugin
                text:  entry.key
              , count: entry.value
              }
          })
        .filter(function(d){                            // Second round of filtering (now that we have the count)
            return wordIsValid_expensive(d.text, d.count)
          })
        .sort(function(a,b){                            // Sort by count
            return b.count-a.count
          })
        .filter(function(d, i){
            return i<250                                // Keep the first items (= highest count)
          })

      // Compute max count once for all
      var maxCount = d3.max(words.map(function(d){ return d.count }))

      // Compute and display tag cloud
      d3.layout.cloud().size([width, height])
        .words(words)                                   // Bind data
        .rotate(function(d) {                           // 5 angles from -60 to +60 degrees
            return ~~(Math.random() * 5) * 30 - 60
          })
        .padding(.8)
        .font('Roboto Condensed')
        .fontSize(function(d) {                         // text from 8 to 48 px
            return 8 + Math.sqrt(d.count/maxCount) * 40
          })
        .on("end", drawCloud)
        .start()

      // SVG text drawing function
      function drawCloud(words){
        
        // Note: the word cloud plugin provides coordinates and rotation for every word of the list

        d3.select("#" + container_id).append("svg")     // We draw directly in the container
            .attr("width", width)
            .attr("height", height)
          .append("g")                                  // Centering
            .attr("transform", 'translate('+width/2+','+height/2+')')
          .selectAll("text")
            .data(words)                                // Data binding
          .enter().append("text")                       // Drawing nodes from computing data
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Roboto Condensed")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
            })
            .text(function(d) { return d.text })
      }

      // Words filtering functions
      function wordIsValid_cheap(word){
        if(word.length < 4)                             // Remove words too small
          return false
        if(word.match(/^[^a-z]+$/gi))                   // Remove words with no letter
          return false
        return true
      }

      function wordIsValid_expensive(word, count){
        if(count < 4)                                   // Remove if too few occurrences
          return false
        if(stop_words_index[word.toLowerCase()])        // Remove stop words
          return false
        return true
      }
      
    }

    return ns
  
}])
