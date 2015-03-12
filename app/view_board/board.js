'use strict';

angular.module('rerere.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope', 'calendarview', 'wordcloud'
  ,function(               $scope ,  calendarview ,  wordcloud) {

  var currentCardId = 0

  $scope.input
  $scope.output
  $scope.inputLinePreview = false
  $scope.outputLinePreview = false
  $scope.outputError = false

  $scope.cards = []

  $scope.startingCode = '// Edit your data here\ndata = data\n.map(function(d, i){\nreturn i\n})'
  
  $('div.split-pane').splitPane()

  init()

  // Scope functions
  $scope.previewRandomInputRow = function(){
    var i = Math.floor(Math.random() * ($scope.input.length))
    ,row = $scope.input[i]
    $scope.inputLinePreview = {
      rowId: i
      ,keys: Object.keys(row)
      ,content: Object.keys(row).map(function(k){return row[k]})
    }
  }

  $scope.previewRandomOutputRow = function(){
    var i = Math.floor(Math.random() * ($scope.output.length))
    ,row = $scope.output[i]
    $scope.outputLinePreview = {
      rowId: i
      ,keys: Object.keys(row)
      ,content: Object.keys(row).map(function(k){return row[k]})
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
      $scope.previewRandomOutputRow()
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
        $scope.previewRandomInputRow()
        $scope.$apply()
      })
  }

  function updateCards(){
    
    $scope.cards.forEach(function(card){
      card.update()
    })

  }

  function addCard(card_type, column_id){
    var card
      ,id = 'card_' + currentCardId++
    switch(card_type){
      case 'CALENDAR VIEW':
        card = calendarview()
        break
      case 'WORD CLOUD':
        card = wordcloud()
        break
    }
    $scope.cards.push({
      card: card
      ,id: id
      ,column: column_id
      ,title: column_id.toUpperCase().replace('_', ' ') + ' - ' + card_type
      ,update: function(){
        this.card.draw(this.id, this.column, $scope.output)
      }
    })
  }

}]);