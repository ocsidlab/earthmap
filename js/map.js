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



// Create dynamic layer
map.on('style.load', function(e) {

    // AQI - fetch latest data from IndiaSpend
    var airQualityRaw;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {

        if (xhr.readyState == XMLHttpRequest.DONE) {

            airQuality = JSON.parse(xhr.responseText);
            console.log(airQuality);

            var sourceObj = new mapboxgl.GeoJSONSource({
                data: GeoJSON.parse(airQuality, {
                    Point: ['lat', 'lon'],
                    include: ['name', 'aqi']
                })
            });

            map.addSource('aqi', sourceObj);

            // Add AQI layers
            map.addLayer({
                "id": "aqi-50",
                "type": "circle",
                "source": "aqi",
                "filter": [
                    "<",
                    "aqi",
                    200
                ],
                "paint": {
                    "circle-color": "hsl(123, 100%, 51%)",
                    "circle-blur": 2,
                    "circle-radius": {
                        "base": 1,
                        "stops": [
                            [
                                4,
                                15
                            ],
                            [
                                13,
                                40
                            ]
                        ]
                    }
                }
            });
            map.addLayer({
                "id": "aqi-50-300",
                "type": "circle",
                "source": "aqi",
                "filter": [
                    "all", [
                        "<",
                        "aqi",
                        300
                    ],
                    [
                        ">",
                        "aqi",
                        50
                    ]
                ],
                "paint": {
                    "circle-color": "hsl(56, 100%, 51%)",
                    "circle-blur": 2,
                    "circle-radius": {
                        "base": 1,
                        "stops": [
                            [
                                4,
                                15
                            ],
                            [
                                13,
                                40
                            ]
                        ]
                    }
                }
            });
            map.addLayer({
                "id": "aqi-300",
                "type": "circle",
                "source": "aqi",
                "filter": [
                    ">",
                    "aqi",
                    300
                ],
                "paint": {
                    "circle-color": "hsl(0, 100%, 51%)",
                    "circle-blur": 2,
                    "circle-radius": {
                        "base": 1,
                        "stops": [
                            [
                                4,
                                15
                            ],
                            [
                                13,
                                40
                            ]
                        ]
                    }
                }
            });
            map.addLayer({
                "id": "aqi-labels",
                "type": "symbol",
                "source": "aqi",
                "minzoom": 7,
                "layout": {
                "text-field": "AQI: {aqi}",
                "text-size": 10
              }
            });



        }
    }
    xhr.open('GET', 'http://aqi.indiaspend.org/aq/api/aqfeed/latestAll/?format=json ', true);
    xhr.send(null);



});
