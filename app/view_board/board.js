'use strict';

angular.module('rerere.view_board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_board', {
    templateUrl: 'view_board/board.html',
    controller: 'BoardCtrl'
  });
}])

.controller('BoardCtrl', ['$scope'
  ,function(               $scope) {
  $('div.split-pane').splitPane()

  $scope.input
  $scope.output
  $scope.inputLinePreview = false

  $scope.startingCode = '// Edit your data here\ndata = data\n.map(function(d, i){\nreturn i\n})'

  init()

  // Scope functions
  $scope.previewRandomRow = function(){
    var i = Math.floor(Math.random() * ($scope.input.length))
    ,row = $scope.input[i]
    $scope.inputLinePreview = {
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
    console.log('update')
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
      // .row(function(d) { return {key: d.key, value: +d.value}; })
      .get(function(error, rows) {
        $scope.input = rows
        $scope.previewRandomRow()
        $scope.$apply()
      })
  }

}]);