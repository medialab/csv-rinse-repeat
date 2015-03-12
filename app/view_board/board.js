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
  $scope.outputLinePreview = false
  $scope.outputError = false

  $scope.startingCode = '// Edit your data here\ndata = data\n.map(function(d, i){\nreturn i\n})'

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
    
    var dom_id = '#timestamp-calendar-view'

    $(dom_id)
      .html('')
      .css('height', '150px')

    var width = 960,
        height = 136,
        padding_top = 20,
        cellSize = 17; // cell size

    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        year = d3.time.format("%Y"),
        format = d3.time.format("%Y-%m-%d");

    var data = d3.nest()
      .key(function(d) { return format(new Date(d.timestamp)); })
      .rollup(function(leaves) { return leaves.length; })
      .map($scope.output);

    var years = d3.set(
        d3.keys(data)
          .map(function(d){return year(new Date(d))})
      )
      .values()
      .map(function(d){return +d})

    var color = d3.scale.quantize()
        .domain([0, d3.max(d3.values(data))])
        .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

    var svg = d3.select(dom_id).selectAll("svg")
        .data(d3.range(d3.min(years), d3.max(years)+1))
      .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
      .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    svg.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

    var rect = svg.selectAll(".day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return week(d) * cellSize; })
        .attr("y", function(d) { return day(d) * cellSize; })
        .datum(format);

    rect.append("title")
        .text(function(d) { return d; });

    svg.selectAll(".month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);

    rect.filter(function(d) { return d in data; })
        .attr("class", function(d) { return "day " + color(data[d]); })
      .select("title")
        .text(function(d) { return d + ": " + data[d] + ' tweets'; });


    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
    }

    /*
    d3.select(self.frameElement).style("height", "2910px");*/
  }

}]);