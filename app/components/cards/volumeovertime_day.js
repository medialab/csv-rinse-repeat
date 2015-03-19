'use strict';

angular.module('rerere.cards.volumeovertime_day', [])

.factory('volumeovertime_day', [
  function() {
    var ns = {}

    // Function called to draw the interface
    ns.draw = function(container_id, table, options){
      
      var column_id = options.column_id

      // Clean the container
      $('#'+container_id)
        .html('&shy;<style>' + ns.css + '</style>')
        .append($('<div class="volumeovertime_day"></div>'))

      // Initialize date formats we will use later
      var day     = d3.time.format("%w")
        , week    = d3.time.format("%U")
        , month   = d3.time.format("%m")
        , year    = d3.time.format("%Y")
        , format  = d3.time.format("%Y-%m-%d")

      var data = d3.nest()
        .key(function(d) {
            return format(new Date(d[column_id]))             // The key is the formatted date ('format' = day precision)
          })
        .rollup(function(leaves) { return leaves.length  })   // The rollup allows to count items (per date)
        .entries(table)                                       // Target of the nesting process
        .sort(function(a,b){
            return new Date(a.key) - new Date(b.key)
          })

      var margin = {top: 20, right: 20, bottom: 30, left: 40}
        , width = $('#'+container_id).width() - margin.left - margin.right
        , containerHeight = 300
        , height = containerHeight - margin.top - margin.bottom

      // Setting size of graphical container
      $('#'+container_id).css('height', containerHeight + 'px')

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1)

      var y = d3.scale.linear()
          .range([height, 0])

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(d3.time.days, 1)
          .tickFormat(d3.time.format('%d'))
          .tickSize(0)
          .tickPadding(8);

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10)

      var svg = d3.select('#'+container_id + ' .volumeovertime_day').append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      x.domain(data.map(function(d) { return new Date(d.key); }));
      y.domain([0, d3.max(data, function(d) { return d.values; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("# items");

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(new Date(d.key)); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.values); })
          .attr("height", function(d) { return height - y(d.values); })
        .append("title")
          .text(function(d) { return d.key + ': ' + d.values + ' items' });
    }

    ns.css = '\
.volumeovertime_day {  \
  font-family: Roboto Condensed, sans-serif;  \
} \
  \
.volumeovertime_day .bar {  \
  fill: steelblue;  \
} \
  \
.volumeovertime_day .bar:hover {  \
  fill: brown;  \
} \
  \
.volumeovertime_day .axis { \
  font-size: 9px;  \
} \
  \
.volumeovertime_day .axis path, \
.volumeovertime_day .axis line {  \
  fill: none; \
  stroke: #000; \
  shape-rendering: crispEdges;  \
} \
  \
.volumeovertime_day .x.axis path {  \
  display: none;  \
}'

    return ns
  
}])
