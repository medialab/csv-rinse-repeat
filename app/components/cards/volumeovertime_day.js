'use strict';

angular.module('rerere.cards.volumeovertime_day', [])

.factory('volumeovertime_day', [
  function() {
    var ns = {}

    ns.name = "DAILY VOLUME"

    ns.description = "Daily count of items as a bar chart"

    ns.shadowContainer = undefined  // Referenced in ns.draw

    // Function called to draw the interface
    ns.draw = function(shadowContainer, table, options){
      
      var column_id = options.column_id

      // Register shadow container
      ns.shadowContainer = shadowContainer

      // Clean it
      ns.shadowContainer.innerHTML = ''

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
        , width = shadowContainer.host.offsetWidth - margin.left - margin.right
        , containerHeight = 300
        , height = containerHeight - margin.top - margin.bottom

      // Setting size of graphical container
      shadowContainer.host.style.height = containerHeight + 'px'

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

      var svg = d3.select(ns.shadowContainer).append("svg")
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

      // Inject CSS
      var s = document.createElement('style')
      s.innerText = ns.css
      ns.shadowContainer.querySelector('svg').appendChild(s)
    }

    ns.css = '\
*{  \
  font-family: Roboto Condensed, sans-serif;  \
} \
  \
.bar {  \
  fill: steelblue;  \
} \
  \
.bar:hover {  \
  fill: brown;  \
} \
  \
.axis { \
  font-size: 9px;  \
} \
  \
.axis path, \
.axis line {  \
  fill: none; \
  stroke: #000; \
  shape-rendering: crispEdges;  \
} \
  \
.x.axis path {  \
  display: none;  \
}'

    return ns
  
}])
