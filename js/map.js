// Add a map
mapboxgl.accessToken = 'pk.eyJ1IjoidG91Y2hzdG9uZWlzdCIsImEiOiJ2OGR5bHhjIn0.WA2NKklxU9FyuU2q44MdjQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/touchstoneist/cindi7tv50100cxnhxul9uwtf', //stylesheet location
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

        airQuality = JSON.parse(xhr.responseText);
        GeoJSON.parse(airQuality,{Point: ['lat', 'lon']});
        console.log(airQuality);

        // Create dynamic layer
        map.on('style.load', function(e) {

           var sourceObj = new mapboxgl.GeoJSONSource({
             data: airQuality,
             buffer: 0
           });

           map.addSource('aqi', sourceObj);

           map.addLayer({
        "id": "aqi-all",
        "type": "symbol",
        "source": "aqi",
        "layout": {
            "icon-image": "{marker-symbol}-15",
            "text-field": "{name}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });

        });
    }
}
xhr.open('GET', 'http://aqi.indiaspend.org/aq/api/aqfeed/latestAll/?format=json ', true);
xhr.send(null);
