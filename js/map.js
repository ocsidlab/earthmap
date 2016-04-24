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
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {

        if (xhr.readyState == XMLHttpRequest.DONE) {

            var airQualityRaw;
            // airQualityRaw = JSON.parse(xhr.responseText);
            airQualityRaw = JSON.parse(xhr.responseText.substring(13,xhr.responseText.length-1), function(k, v) {
                return (k === "aqi") ? parseInt(v) : v;
            });

            // var airQuality = GeoJSON.parse(airQualityRaw, {
            //     Point: ['lat', 'lon'],
            //     include: ['name','city', 'aqi']
            // })
            console.log(airQualityRaw);
            var airQuality = GeoJSON.parse(airQualityRaw, {
                Point: ['lat', 'lon'],
                include: ['name','city', 'aqi']
            })


            var sourceObj = new mapboxgl.GeoJSONSource({
                data: airQuality
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
                    "circle-color": "hsl(196, 100%, 50%)",
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
                        250
                    ],
                    [
                        ">",
                        "aqi",
                        50
                    ]
                ],
                "paint": {
                    "circle-color": "hsl(48, 100%, 50%)",
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
                "id": "aqi-250-400",
                "type": "circle",
                "source": "aqi",
                "filter": [
                    "all", [
                        "<",
                        "aqi",
                        400
                    ],
                    [
                        ">",
                        "aqi",
                        250
                    ]
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
                "id": "aqi-400",
                "type": "circle",
                "source": "aqi",
                "filter": [
                    ">",
                    "aqi",
                    400
                ],
                "paint": {
                    "circle-color": "hsl(0, 91%, 19%)",
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
                "text-field": "AQI: {aqi} {city}",
                "text-size": 10
              }
            });



        }
    }
    // xhr.open('GET', 'http://aqi.indiaspend.org/aq/api/aqfeed/latestAll/?format=json', true);
    xhr.open('GET', 'http://mapqb.waqi.info/mapq/bounds/?lurlv2&z=7&lang=en&jsoncallback=mapAddMakers&key=_1ca%27%12%1Cv%11%11%1F%237BI%3B%1C%1B&bounds=((10.486331518916343,75.85197317812504),(14.348089290523568,81.03752005312504))', true);
    xhr.send(null);

    function fetchData(){

    }



});
