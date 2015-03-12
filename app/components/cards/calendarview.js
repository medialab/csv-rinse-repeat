'use strict';

angular.module('rerere.cards.calendarview', [])

.factory('calendarview', [
  function() {
    return function() {
      var ns = {}

      ns.draw = function(container_id, column_id, table){
        $('#'+container_id)
          .html('')

        var width = $('#'+container_id).width(),
            cellSize = 14,
            height = 17 + 7 * cellSize,
            padding_top = 20

        $('#'+container_id).css('height', (height + 12) + 'px')

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

        var color = d3.scale.quantize()
            .domain([0, d3.max(d3.values(data))])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        var svg = d3.select('#'+container_id).selectAll("svg")
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

      return ns
    }
  
}])


/*
// http://stackoverflow.com/questions/9345003/can-i-inject-a-css-file-programmatically-using-a-content-script-js-file
var link = document.createElement("link");
link.href = "http://example.com/mystyle.css";
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);
*/