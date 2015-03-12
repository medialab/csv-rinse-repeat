'use strict';

angular.module('rerere.cards.calendarview', [])

.factory('calendarview', [
  function() {
    return function() {
      var ns = {}

      ns.draw = function(container_id, column_id, table){
        $('#'+container_id)
          .html('&shy;<style>' + ns.css + '</style>') // Clean and inject CSS
          .append($('<div class="calendarview"></div>'))

        var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            year = d3.time.format("%Y"),
            format = d3.time.format("%Y-%m-%d");

        var data = d3.nest()
          .key(function(d) { return format(new Date(d[column_id])); })
          .rollup(function(leaves) { return leaves.length; })
          .map(table);

        var years = d3.set(
            d3.keys(data)
              .map(function(d){return year(new Date(d))})
          )
          .values()
          .map(function(d){return +d})

        var width = $('#'+container_id).width(),
            cellSize = 14,
            height = (17 + 7 * cellSize) * years.length,
            padding_top = 20

        $('#'+container_id).css('height', (height + 12) + 'px')

        var color = d3.scale.quantize()
            .domain([0, d3.max(d3.values(data))])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        var svg = d3.select('#'+container_id + ' .calendarview').selectAll("svg")
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
      }

      ns.css = "\
.d3-panel .calendarview {\
  font: 11px Roboto, sans-serif;\
  shape-rendering: crispEdges;\
}\
\
.d3-panel .calendarview .day {\
  fill: #fff;\
  stroke: #f6f6f6;\
}\
\
.d3-panel .calendarview .month {\
  fill: none;\
  stroke: #000;\
  stroke-width: 2px;\
}\
\
.d3-panel .calendarview .q0-11{fill:#fff}\
.d3-panel .calendarview .q1-11{fill:#ffffd9}\
.d3-panel .calendarview .q2-11{fill:#edf8b1}\
.d3-panel .calendarview .q3-11{fill:#c7e9b4}\
.d3-panel .calendarview .q4-11{fill:#7fcdbb}\
.d3-panel .calendarview .q5-11{fill:#41b6c4}\
.d3-panel .calendarview .q6-11{fill:#1d91c0}\
.d3-panel .calendarview .q7-11{fill:#225ea8}\
.d3-panel .calendarview .q8-11{fill:#253494}\
.d3-panel .calendarview .q9-11{fill:#081d58}\
.d3-panel .calendarview .q10-11{fill:#000}\
"

      return ns
    }
  
}])
