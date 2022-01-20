console.log("logic.js loaded")

let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {

    let format = d3.timeFormat("%m-%d-%Y %H:%M");

    layer.bindPopup(`<h1> Place: ${feature.properties.place}</h1>
      <hr><p> Date: ${format(feature.properties.time)}</p>
      <hr><p> Magnitude: ${feature.properties.mag}</p>
      <hr><p> Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  let earthquakes = L.geoJSON(earthquakeData, {

    onEachFeature: onEachFeature,

    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "#000000",
        weight: 1,
        fillOpacity: 10
      });
    }

  });

  createMap(earthquakes);
}

function markerSize(magnitude) {
  return magnitude * 3;
}

function markerColor(depth) {
  if (depth <= 20) {
    return "#fa9fb5"
  }
  else if (depth <= 40) {
    return "#f768a1"
  }
  else if (depth <= 60) {
    return "#dd3497"
  }
  else if (depth <= 80) {
    return "#ae017e"
  }
  else if (depth <= 100) {
    return "#7a0177"
  }
  else {
    return "#49006a"
  }
}

function getColor(d) {
  return  d > 100 ? "#49006a" :
          d > 80  ? "#7a0177" :
          d > 60  ? "#ae017e" :
          d > 40  ? "#dd3497" :
          d > 20  ? "#f768a1" :
                    "#fa9fb5";
}

let legend = L.control({position: "bottomright"});

legend.onAdd = function() {

  let div = L.DomUtil.create("div", "info legend");
    depth = [0, 20, 40, 60, 80, 100],
    labels = [];

    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
          depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
  }

  return div;

};



function createMap(earthquakes) {

  let baseMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  let overlayMap = {
    earthquakes: earthquakes
  };

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [baseMap, earthquakes]
  });

  legend.addTo(myMap);


}

