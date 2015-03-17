'use strict';

angular.module('rerere.cards.wordcloud', [])

.factory('wordcloud', [
  function() {
    return function() {
      var ns = {}
         ,en_stop_words = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your']
         ,fr_stop_words = ['alors', 'au', 'aucuns', 'aussi', 'autre', 'avant', 'avec', 'avoir', 'bon', 'car', 'ce', 'cela', 'ces', 'ceux', 'chaque', 'ci', 'comme', 'comment', 'dans', 'des', 'du', 'dedans', 'dehors', 'depuis', 'devrait', 'doit', 'donc', 'dos', 'début', 'elle', 'elles', 'en', 'encore', 'essai', 'est', 'et', 'eu', 'fait', 'faites', 'fois', 'font', 'hors', 'ici', 'il', 'ils', 'je  juste', 'la', 'le', 'les', 'leur', 'là', 'ma', 'maintenant', 'mais', 'mes', 'mine', 'moins', 'mon', 'mot', 'même', 'ni', 'nommés', 'notre', 'nous', 'ou', 'où', 'par', 'parce', 'pas', 'peut', 'peu', 'plupart', 'pour', 'pourquoi', 'quand', 'que', 'quel', 'quelle', 'quelles', 'quels', 'qui', 'sa', 'sans', 'ses', 'seulement', 'si', 'sien', 'son', 'sont', 'sous', 'soyez sujet', 'sur', 'ta', 'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop', 'très', 'tu', 'voient', 'vont', 'votre', 'vous', 'vu', 'ça', 'étaient', 'état', 'étions', 'été', 'être']
         ,web_stop_words = ['www', 'http', 'https', 'pdf', 'twitter']
         ,stop_words_index = {}

      // build stop words index
      en_stop_words
        .concat(fr_stop_words)
        .concat(web_stop_words)
        .forEach(function(w){
            stop_words_index[w] = true
          })

      ns.draw = function(container_id, column_id, table){
        var fill = d3.scale.category20();

        $('#'+container_id)
          .html('&shy;<style>' + ns.css + '</style>') // Clean and inject CSS
          .append($('<div class="wordcloud"></div>'))

        var words_index = {}
          , strings = table.map(function(d){return ''+d[column_id]})
          , words = []
          , maxCount = 0
          , width = $('#'+container_id).width()
          , height = 400

        strings.forEach(function(string){
          // Tokenize
          var words = string.match(/[^\s\.,!?:\/'"]+/g)

          words.forEach(function(word){
            if(wordIsValid_cheap(word))
              words_index[word] = (words_index[word] || 0) + 1
          })
        })

        for(let word in words_index){
          var count = words_index[word]
          if(wordIsValid_expensive(word, count)){
            words.push({text: word, count: count})
            maxCount = Math.max(count, maxCount)
          }
        }

        // console.log(words)

        // Compute and display tag cloud
        d3.layout.cloud().size([width, height])
          .words(words)
          .padding(5)
          // .rotate(function() { return ~~(Math.random() * 2) * 90; })
          .rotate(function(d) { return ~~(Math.random() * 5) * 30 - 60; })
          .padding(.8)
          .font('Roboto Condensed')
          .fontSize(function(d) { return 8 + Math.sqrt(d.count/maxCount) * 40; })
          .on("end", drawCloud)
          .start();

        function drawCloud(words){
          d3.select("#" + container_id).append("svg")
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("transform", 'translate('+width/2+','+height/2+')')
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .style("font-size", function(d) { return d.size + "px"; })
              .style("font-family", "Roboto Condensed")
              .style("fill", function(d, i) { return fill(i); })
              .attr("text-anchor", "middle")
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.text; });
        }

        function wordIsValid_cheap(word){
          if(word.length < 4)
            return false
          if(word.match(/^[^a-z]+$/gi))
            return false
          return true
        }

        function wordIsValid_expensive(word, count){
          if(count < 3)
            return false
          if(stop_words_index[word.toLowerCase()])
            return false
          return true
        }
        
      }

      ns.css = "\
"

      return ns
    }
  
}])
