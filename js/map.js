// Add a map
mapboxgl.accessToken = 'pk.eyJ1IjoicnVjaGlrYW5hbWJpYXIiLCJhIjoiY2ltZWpiMXNpMDB6OXUxa2swN3VqbDEyZyJ9.eBbIitymKP-QVel_NGj_Cw';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
  hash: true,
  zoom: 4,
  center: [79.0806091, 21.1498041]
});

// map.addControl(new mapboxgl.Geocoder({'position':'top-right'}));

// AQI - fetch latest data from IndiaSpend
var airQualityRaw;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
        airQualityRaw = xhr.responseText;
        console.log(airQualityRaw);
    }
}
xhr.open('GET', 'http://aqi.indiaspend.org/aq/api/aqfeed/latestAll/?format=json', true);
xhr.send(null);

// Dynamic map styling
map.on('style.load', function(e) {



});
