// Simple map
mapboxgl.accessToken = 'pk.eyJ1IjoicnVjaGlrYW5hbWJpYXIiLCJhIjoiY2ltZWpiMXNpMDB6OXUxa2swN3VqbDEyZyJ9.eBbIitymKP-QVel_NGj_Cw';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
  hash: true,
  zoom: 4,
  center: [79.0806091, 21.1498041]
});

// Add geocoder https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md
// map.addControl(new mapboxgl.Geocoder({'position':'top-right'}));
var trainToLayersMap = {
  'rajdhani': {
    'id': 'Raj',
    'title': 'Rajdhani Express',
    'text': 'High speed priority trains that connect major cities to the capital'
    },
  'duronto': {
    'id': 'Drnt',
    'title': 'Duronto Express',
    'text': 'High speed non-stop trains connecting major cities'
    },
  'shatabdi': {
    'id': 'Shtb',
    'title': 'Shatabdi and Janshatabdi Express',
    'text': 'High speed day trains connecting metros to other cities'
    },
  'garibrath': {
    'id': 'GR',
    'title': 'Garib Rath Express',
    'text': 'High speed air-conditioned trains at subsidized rates'
    },
  'passenger': {
    'id': 'Pass',
    'title': 'Passenger Trains',
    'text': 'Low-cost slow trains that halt at most or every station along the way'
  },
  'mail': {
    'id': 'Mail',
    'title': 'Mail Trains',
    'text': 'High speed trains with few halts along the way'
  }
};

map.on('style.load', function(e) {
  // Do interactive things.

  $('.toggles a').on('click', function(e) {
    e.preventDefault();
    var trainType = e.target.id.split('#')[0];
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
    } else {
      $('.toggles a').removeClass('active');
      $(this).addClass('active');
    }

    var trainLayerId = trainToLayersMap[trainType].id;
    Object.keys(trainToLayersMap).forEach(function (type) {
      if (type != trainType) {
        hide(trainToLayersMap[type].id);
      }
    });

    toggle(trainLayerId);
    setInfo(trainType);
  });

  // Highlight terminating trains on selecting stations
  map.on('click', function (e) {

    var stations = map.queryRenderedFeatures([[e.point.x-3,e.point.y-3],[e.point.x+3,e.point.y+3]], { layers: ["origins>1"] });
      if (stations.length) {
        // console.log(station[0].properties.code);
        map.setLayoutProperty("Terminating Trains","visibility","visible");
        map.setLayoutProperty("Highlight Station","visibility","visible");

        stationFilter = new Array();
        stationFilter.push("any");

        stationHighlightFilter = new Array();
        stationHighlightFilter.push("any");

        for( var i = 0; i < stations.length; i++){
          stationFilter.push(["==","from_station_code",stations[i].properties.code]);
          stationFilter.push(["==","to_station_code",stations[i].properties.code]);
          stationHighlightFilter.push(["==","code",stations[i].properties.code]);
        }

        map.setFilter("Terminating Trains", stationFilter);
        map.setFilter("Highlight Station", stationHighlightFilter);

        console.log(stationHighlightFilter);

        // terminating_trains = map.querySourceFeatures({ layers: ["trainclasses"], filter: ["==", "from_station_code", "MAS"] });
        // console.log(terminating_trains);
        // document.getElementById('station-details').innerHTML = JSON.stringify(station[0].properties, null, 2);
        // map.setFilter("route-hover", ["==", "name", features[0].properties.name]);
      } else {
          map.setLayoutProperty("Terminating Trains","visibility","none");
          map.setLayoutProperty("Highlight Station","visibility","none");
      }

  })

});


function toggle(id) {
  var currentState = map.getLayoutProperty(id, 'visibility');
  var nextState = currentState === 'none' ? 'visible' : 'none';
  map.setLayoutProperty(id, 'visibility', nextState);
}

function hide(id) {
  map.setLayoutProperty(id, 'visibility', 'none');
}

function setInfo(type) {
  var title = trainToLayersMap[type].title;
  var text = trainToLayersMap[type].text;

  $('.info #title').text(title);
  $('.info #text').text(text);
}
