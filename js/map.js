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

    // Add AQI source and layers
    var aqiDataLayer = new mapboxgl.GeoJSONSource();
    map.addSource('aqi', aqiDataLayer);

    map.addLayer({
        "id": "aqi-50",
        "type": "circle",
        "source": "aqi",
        "filter": [
            "<",
            "aqi",
            50
        ],
        "paint": {
            "circle-color": "hsl(221, 100%, 60%)",
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
        "id": "aqi-20-50",
        "type": "circle",
        "source": "aqi",
        "filter": [
            "all", [
                "<",
                "aqi",
                50
            ],
            [
                ">",
                "aqi",
                20
            ]
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
        "id": "aqi-50-150",
        "type": "circle",
        "source": "aqi",
        "filter": [
            "all", [
                "<",
                "aqi",
                150
            ],
            [
                ">",
                "aqi",
                50
            ]
        ],
        "paint": {
            "circle-color": "hsl(108, 100%, 50%)",
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
        "id": "aqi-150-250",
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
                150
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
        "minzoom": 8,
        "layout": {
            "text-field": "AQI: {aqi} {name}",
            "text-size": 10
        }
    });

    // Fetch Air Quality Index data feed
    var airQuality = [];

    // aqicn.org
    var xhrAQICN = new XMLHttpRequest();
    xhrAQICN.onreadystatechange = function() {

        if (xhrAQICN.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrAQICN.responseText.substring(13, xhrAQICN.responseText.length - 1), function(k, v) {
                return (k === "aqi") ? parseInt(v) : v;
            });

            // console.log(response);
            // Update properties
            for (var row in response) {
                response[row]["id"] = response[row]["idx"];
                response[row]["time"] = response[row]["stamp"];
                response[row]["name"] = response[row]["city"];
                response[row]["source"] = "AQICN";
            }

            // console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // IndiaSpend #breathe
    var xhrINDIASPEND = new XMLHttpRequest();
    xhrINDIASPEND.onreadystatechange = function() {

        if (xhrINDIASPEND.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrINDIASPEND.responseText);

            // Add source
            for (var row in response) {
                response[row]["source"] = "IndiaSpend";
            }

            // console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // Update the feeds
    xhrINDIASPEND.open('GET', 'http://aqi.indiaspend.org/aq/api/aqfeed/latestAll/?format=json', true);
    xhrINDIASPEND.send(null);

    map.on('moveend', function(e) {
        var xhrAQICNBounds = map.getBounds()._sw.lat + ',' + +map.getBounds()._sw.lng + '),(' + map.getBounds()._ne.lat + ',' + map.getBounds()._ne.lng;
        xhrAQICN.open('GET', 'http://mapqb.waqi.info/mapq/bounds/?lurlv2&z=7&lang=en&jsoncallback=mapAddMakers&key=_1ca%27%12%1Cv%11%11%1F%237BI%3B%1C%1B&bounds=((' + xhrAQICNBounds + '))', true);
        xhrAQICN.send(null);
    });
    map.fire('moveend');

    // Update the datasets with the latest feed and redraw the map
    function updateDataLayer(layerID, feed) {

        if (layerID == 'aqi') {

            // Remove any existing data from the same source and concat the feed
            for (var row in airQuality) {
                if (airQuality[row].source == feed[0].source)
                    airQuality.splice(row, 1);
            }
            airQuality = airQuality.concat(feed);

            // console.log(airQuality);

            var data = GeoJSON.parse(airQuality, {
                Point: ['lat', 'lon'],
                include: ['id', 'name', 'aqi', 'source', 'time']
            })

            aqiDataLayer.setData(data);
        }

    }


});
