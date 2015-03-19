'use strict';

angular.module('rerere.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope', '$timeout',  'cards'
  ,function(               $scope ,  $timeout ,  _cards ) {

  var currentCardId = 0
    , _output
    , _input

  $scope.outputColumns = []
  $scope.inputLinePreviews = false
  $scope.outputLinePreviews = false
  $scope.outputError = false

  $scope.inputRowsCount = 1
  $scope.outputRowsCount = 1

  $scope.newCardProcess = {active:false}

  $scope.cards = []
  $scope.cardTypes = _cards.cardsList
  var cardUpdateMap = d3.map()

  $scope.startingCode = '// Edit your data here\ndata = data\n.map(function(d, i){\nreturn i\n})'
  
  $('div.split-pane').splitPane()

  init()

  // Scope functions
  $scope.previewRandomInputRows = function(){
    $scope.inputLinePreviews = []
    for(let i=0; i<$scope.inputRowsCount; i++){
      var rowId = Math.floor(Math.random() * (_input.length))
      ,row = _input[rowId]
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
      var rowId = Math.floor(Math.random() * (_output.length))
      ,row = _output[rowId]
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
      , output = []
      , success = true

    try{

      output = (function(_input, code, undefined){
        var output
          , input = _input.map(function(obj){            // Clone to prevent input corruption
                return $.extend({}, obj)
              })
        eval(code)
        return output
      })(_input, code)

    } catch(e) {

      console.log('ERROR', e)
      success = false
      $scope.outputError = e.message

    }
    
    if(success){
      _output = output
      $scope.outputColumns = d3.keys(_output[0])
      $scope.previewRandomOutputRows()
      $scope.outputError = false

      updateCards()
    } else {
      _output = false
      $scope.outputColumns = d3.keys(_output[0])
      $scope.outputLinePreview = false
    }

  }

  $scope.newCard_addViz = function(){
    $scope.newCardProcess.active = true
    $scope.newCardProcess.step = 'select'
  }

  $scope.newCard_selectViz = function(card){
    $scope.newCardProcess.active = true
    $scope.newCardProcess.card = card
    $scope.newCardProcess.step = 'options'
  }

  $scope.newCard_selectColumn = function(col){
    $scope.newCardProcess.active = false
    addCard($scope.newCardProcess.card.id, col)

    if(_output)
      $timeout(cardCascadeUpdate, 0)
  }

  // Internal functions
  function init(){
    // Init Ace JS editor panel
    // Note: we keep editor in global scope to be able to edit settings from the console
    window.editor = ace.edit("js-editor");
    window.editor.setTheme("ace/theme/chrome");
    window.editor.setFontSize(14)
    window.editor.getSession().setMode("ace/mode/javascript");

    // Load Test CSV
    d3.csv("test.csv")
      .get(function(error, rows) {
        _input = rows
        $scope.outputColumns = d3.keys(_input[0])
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
    console.log(card_type, column_id)
    try{
      var id = 'card_' + currentCardId++
        , card = _cards[card_type]
      $scope.cards.push({
        card: card
        ,id: id
        ,column: column_id
        ,title: column_id.toUpperCase().replace('_', ' ') + ' - ' + card_type
        ,update: function(){

          // Clean
          $('#' + column_id).html('')

          // Draw
          card.draw(id, _output, {column_id: column_id})

          // Mark as updated
          cardUpdateMap.set(id, false)

          // Trigger next update
          $timeout(cardCascadeUpdate, 300)

        }

      })

      // Mark as 'to update'
      cardUpdateMap.set(id, true)

    } catch(e) {
      console.log('Card could not be added', card_type, e)
    }
  }

}]);