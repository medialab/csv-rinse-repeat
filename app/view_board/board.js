'use strict';

angular.module('rerere.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope', 'calendarview', 'wordcloud', '$timeout'
  ,function(               $scope ,  calendarview ,  wordcloud ,  $timeout) {

  var currentCardId = 0

  $scope.input
  $scope.output
  $scope.inputLinePreviews = false
  $scope.outputLinePreviews = false
  $scope.outputError = false

  $scope.inputRowsCount = 1
  $scope.outputRowsCount = 1

  $scope.cards = []
  var cardUpdateMap = d3.map()

  $scope.startingCode = '// Edit your data here\ndata = data\n.map(function(d, i){\nreturn i\n})'
  
  $('div.split-pane').splitPane()

  init()

  // Scope functions
  $scope.previewRandomInputRows = function(){
    $scope.inputLinePreviews = []
    for(let i=0; i<$scope.inputRowsCount; i++){
      var rowId = Math.floor(Math.random() * ($scope.input.length))
      ,row = $scope.input[rowId]
      $scope.inputLinePreviews.push({
        rowId: rowId
        ,keys: Object.keys(row)
        ,content: Object.keys(row).map(function(k){return row[k]})
      })
    }
  }

  $scope.inputCheckValidate_inputPreview = function(e){
    if(e.which == 13){
      $scope.previewRandomInputRows()
      $('.input-narrow').blur()
    }
  }

  $scope.previewRandomOutputRows = function(){
    $scope.outputLinePreviews = []
    for(let i=0; i<$scope.outputRowsCount; i++){
      var rowId = Math.floor(Math.random() * ($scope.output.length))
      ,row = $scope.output[rowId]
      $scope.outputLinePreviews.push({
        rowId: rowId
        ,keys: Object.keys(row)
        ,content: Object.keys(row).map(function(k){return row[k]})
      })
    }
  }

  $scope.inputCheckValidate_outputPreview = function(e){
    if(e.which == 13){
      $scope.previewRandomOutputRows()
      $('.input-narrow').blur()
    }
  }

  $scope.codeKeyPress = function(e){
    if((e.which == 13 || e.which == 10) && (e.ctrlKey || e.shiftKey)){
      $scope.updateOutput();
    }
  }

  $scope.updateOutput = function(){
    var code = window.editor.getValue()
    ,output = []
    ,success = true

    try{

      output = (function(input, code, undefined){
        var output
        eval(code)
        return output
      })($scope.input, code)

    } catch(e) {

      console.log('ERROR', e)
      success = false
      $scope.outputError = e.message

    }
    
    if(success){
      $scope.output = output
      $scope.previewRandomOutputRows()
      $scope.outputError = false

      updateCards()
    } else {
      $scope.output = false
      $scope.outputLinePreview = false
    }

  }

  // Internal functions
  function init(){
    // Init Ace JS editor panel
    // Note: we keep editor in global scope to be able to edit settings from the console
    window.editor = ace.edit("js-editor");
    window.editor.setTheme("ace/theme/chrome");
    window.editor.setFontSize(14)
    window.editor.getSession().setMode("ace/mode/javascript");

    // Add starting cards
    addCard('CALENDAR VIEW', 'timestamp')
    addCard('WORD CLOUD', 'text')

    // Load Test CSV
    d3.csv("test.csv")
      // .row(function(d) { return {key: d.key, value: +d.value}; })
      .get(function(error, rows) {
        $scope.input = rows
        $scope.previewRandomInputRows()
        $scope.$apply()
      })
  }

  function updateCards(){
    
    $scope.cards.forEach(function(card){
      cardUpdateMap.set(card.id, true)
      $('#' + card.id).html('<div class="card-loading">Loading...</div>')
    })

    $timeout(cardCascadeUpdate, 300)

  }

  function cardCascadeUpdate(){
    var cardId
    cardUpdateMap.forEach(function(id, toUpdate){
      if(cardId === undefined && toUpdate){
        cardId = id
      }
    })
    if(cardId){

      var card

      $scope.cards.some(function(c){
        if(c.id == cardId){
          card = c
          return true
        }
        return false
      })

      if(card){
        card.update()
      }

    }
  }

  function addCard(card_type, column_id){
    var graphicsModule
      , id = 'card_' + currentCardId++
    switch(card_type){
      case 'CALENDAR VIEW':
        graphicsModule = calendarview()
        break
      case 'WORD CLOUD':
        graphicsModule = wordcloud()
        break
    }
    $scope.cards.push({
      module: graphicsModule
      ,id: id
      ,column: column_id
      ,title: column_id.toUpperCase().replace('_', ' ') + ' - ' + card_type
      ,update: function(){

        // Clean
        $('#' + column_id).html('')

        // Draw
        graphicsModule.draw(id, column_id, $scope.output)

        // Mark as updated
        cardUpdateMap.set(id, false)

        // Trigger next update
        $timeout(cardCascadeUpdate, 300)

      }
    })
  }

}]);