'use strict';

angular.module('rerere.cards.mapcoordinates', [])

.factory('mapcoordinates', [
  function() {
    var ns = {}

    ns.name = "MAP COORDINATES"

    ns.description = "Geographical distribution of items with dynamic clustering. Coordinates format: '0.0::0.0' (latitude - longitude)"

    // Function called to draw the interface
    ns.draw = function(container_id, table, options){
      
      var column_id = options.column_id

      $('#' + container_id)
        .html('')
        .height(300)
        .css('margin-top', '0px')

      // Projections
      var fromProjection = new ol.proj.Projection({code: 'EPSG:4326'})
        , toProjection   = new ol.proj.Projection({code: 'EPSG:3857'})

      var separator = '::'
        , data = table
          .map(function(item){
              return (item[column_id] || '').split(separator)
            })
          .map(function(coordinates){
              return coordinates.map(function(d){return +d})
            })
          .filter(function(coordinates){
              return coordinates.length == 2
                  && !isNaN(coordinates[0])
                  && !isNaN(coordinates[1])
            })
          .map(function(coordinates){
              return [coordinates[1], coordinates[0]]
            })
          .map(function(coordinates){
              var xy = ol.proj.transform(coordinates, fromProjection, toProjection)
              return xy
            })
          // .filter(function(xy){
          //     return !isNaN(xy[0])
          //         && !isNaN(xy[1])
          //   })
          .map(function(xy){
              return new ol.Feature(new ol.geom.Point(xy))
            })

      var maxItems = data.length

      var source = new ol.source.Vector({
        features: data
      })

      var clusterSource = new ol.source.Cluster({
        distance: 30,
        source: source
      });

      var styleCache = {};
      var clusters = new ol.layer.Vector({
        source: clusterSource,
        style: function(feature, resolution) {
          var size = feature.get('features').length;
          var style = styleCache[size];
          if (!style) {
            style = [new ol.style.Style({
              image: new ol.style.Circle({
                radius: Math.max( 8 , Math.round( 30 * Math.sqrt(size / maxItems))),
                fill: new ol.style.Fill({
                  color: '#31708f'
                })
              }),
              text: new ol.style.Text({
                text: size.toString(),
                font: 'Roboto Condensed',
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            })];
            styleCache[size] = style;
          }
          return style;
        }
      });



      var attribution = new ol.control.Attribution({
        collapsible: false
      })

      var map = new ol.Map({
        target: container_id,
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
          , clusters
        ],
        controls: ol.control.defaults({ attribution: false }).extend([attribution]),
        view: new ol.View({
          center: [0, 0],
          zoom: 2
        })
      });
    }

    return ns
  
}])
