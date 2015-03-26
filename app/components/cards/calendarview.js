'use strict';

angular.module('rerere.cards.calendarview', [])

.factory('calendarview', [
  function() {
    var ns = {} // Namespace

    ns.name = "CALENDAR"

    ns.description = "Daily count of items in a calendar view"

    ns.download = function(container_id){
      var svgContainer = $('#'+container_id + ' svg')
        , w = svgContainer.width()
        , h = svgContainer.height()
        , content = []

      content.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">')
      content.push(svgContainer.html())
      content.push('<style>' + ns.css + '</style>')
      content.push('</svg>')

      console.log('Print blob', content)

      var blob = new Blob(content, {type: "image/svg+xml;charset=utf-8"})
      saveAs(blob, ns.name + ".svg")

    }

    ns.draw = function(container_id, table, options){
      
      var column_id = options.column_id
      
      // Reset the content of the container
      $('#'+container_id)
        .html('')

      // Initialize date formats we will use later
      var day = d3.time.format("%w")
        , week = d3.time.format("%U")
        , year = d3.time.format("%Y")
        , format = d3.time.format("%Y-%m-%d")

      // Reshape the data to count occurrences for each date
      var data = d3.nest()                                    // Nesting aggregates data by a given key
        .key(function(d) {
            return format(new Date(d[column_id]))             // The key is the formatted date ('format' = day precision)
          })
        .rollup(function(leaves) { return leaves.length  })   // The rollup allows to count items (per date)
        .map(table)                                           // Target of the nesting process

      // We count which years are represented in data (useful later)
      var years = d3.set(                                     // The set gives a list of unique items (years)
          d3.keys(data)                                       
            .map(function(d){return year(new Date(d))})       // Reformat full dates to years
        )
        .values()                                             // Get the unique values from the set
        .map(function(d){return +d})                          // Ensure they are numbers

      // Graphic variables for integration in the interface
      var width = $('#'+container_id).width()                 // Width of the graphical space cannot be set, we just get it
        , cellSize = 14                                       // Size of the date cells, impacts height
        , height = (17 + 7 * cellSize) * years.length         // Height can be set (for yearly block)
        , padding_top = 20                                    // Padding added because the title uses space in the UI

      // Setting size of graphical container
      $('#'+container_id).css('height', (height + 12) + 'px')

      // 'color' maps values to CSS classes 'q0-11' to 'q10-11' containing a color scale
      var color = d3.scale.quantize()                         // Specifies a discrete scale as a mapping function
          .domain([0, d3.max(d3.values(data))])               // Input of this function: 0 to max count
          .range(
              d3.range(11)                                    // Output of this function: 11 possible values...
                .map(function(d) { return "q" + d + "-11" })  // ...from 'q0-11' to 'q10-11'
            )

      // Draw each year as a different calendar block
      var svg = d3.select('#'+container_id).selectAll("svg")
          .data(d3.range(d3.min(years), d3.max(years)+1))     // Bind years to svg elements in container
        .enter().append("svg")                                // Create a SVG for each year
          .attr("width", width)                               // Width of yearly block
          .attr("height", height)                             // Height of yearly block
        .append("g")                                          // Create a svg group
          .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")")
                                                              // Translate this group: stack yearly blocks top down, centered

      // Add key text to indicate the year
      svg.append("text")
          .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
          .style("text-anchor", "middle")
          .text(function(d) { return d })                     // Remember that svg is bound to years range

      // Draw the rectangles for days of the year (not filled with color yet)
      var rect = svg.selectAll(".day")
          .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                                                              // Bind each day of the year to '.day' items (CSS class)
        .enter().append("rect")                               // Create a svg rectangle for each day
          .attr("class", "day")                               // Add it the .day class
          .attr("width", cellSize)                            // Cell width
          .attr("height", cellSize)                           // Cell width
          .attr("x", function(d) {                            // Placement:
              return week(d) * cellSize                       //  weeks give the X
            })
          .attr("y", function(d) {
              return day(d) * cellSize                        //  day of the week gives the Y
            })
          .datum(format)                                      // Bind the date format
                                                              // Note: we use datum and not data because the days of the year
                                                              //       do not vary (the .enter() clause does not matter)

      // Add a tooltip with the date to the rectangle
      rect.append("title")
          .text(function(d) { return d; });

      // Add a black stroke for each month
      svg.selectAll(".month")
          .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
        .enter().append("path")
          .attr("class", "month")
          .attr("d", monthPath)                               // Complex code to write the path in a function below

      // Finally fill rectangles with color depending on data
      rect.filter(function(d) { return d in data })           // Filter the rectangles when they match a date we have in data
          .attr("class", function(d) {                        // Modify the CSS class:
              return "day " + color(data[d])                  //  keep 'day' class and add the right color class
            })
        .select("title")
          .text(function(d) {
              return d + ": " + data[d] + ' items'            // Add tooltip including the count
            })

      // Inject CSS
      $('#' + container_id + ' svg').append($('<style/>').text(ns.css))

      // Drawing the path surronding months in calendar
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

    // The CSS to be injected
    // Note: backslashes allow multiline text -  oes not work in every browser
    ns.css = "\
*{\
font: 11px Roboto, sans-serif;\
shape-rendering: crispEdges;\
}\
\
.day {\
fill: #fff;\
stroke: #f6f6f6;\
}\
\
.month {\
fill: none;\
stroke: #000;\
stroke-width: 2px;\
}\
\
.q0-11{fill:#fff}\
.q1-11{fill:#ffffd9}\
.q2-11{fill:#edf8b1}\
.q3-11{fill:#c7e9b4}\
.q4-11{fill:#7fcdbb}\
.q5-11{fill:#41b6c4}\
.q6-11{fill:#1d91c0}\
.q7-11{fill:#225ea8}\
.q8-11{fill:#253494}\
.q9-11{fill:#081d58}\
.q10-11{fill:#000}\
"
    return ns
  
}])
