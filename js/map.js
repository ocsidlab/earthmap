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
        "id": "aqi-10",
        "type": "circle",
        "source": "aqi",
        "filter": [
            "<",
            "aqi",
            10
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
        "id": "aqi-10-50",
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
                10
            ]
        ],
        "paint": {
            "circle-color": "green",
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
        "id": "aqi-50-100",
        "type": "circle",
        "source": "aqi",
        "filter": [
            "all", [
                "<",
                "aqi",
                100
            ],
            [
                ">",
                "aqi",
                50
            ]
        ],
        "paint": {
            "circle-color": "yellow",
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
        "id": "aqi-100-150",
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
                100
            ]
        ],
        "paint": {
            "circle-color": "orange",
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
        "id": "aqi-150-200",
        "type": "circle",
        "source": "aqi",
        "filter": [
            "all", [
                "<",
                "aqi",
                200
            ],
            [
                ">",
                "aqi",
                150
            ]
        ],
        "paint": {
            "circle-color": "red",
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
        "id": "aqi-200-300",
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
                200
            ]
        ],
        "paint": {
            "circle-color": "purple",
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
        "id": "aqi-300-400",
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
                300
            ]
        ],
        "paint": {
            "circle-color": "maroon",
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
            "circle-color": "hsl(0, 0%, 0%)",
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
        "paint": {
          "text-halo-color": "white",
          "text-halo-width": 1,
          "text-halo-blur": 3
        },
        "layout": {
            "text-field": "AQI: {aqi}",
            "text-size": 12
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
    // API
    var xhrINDIASPEND = new XMLHttpRequest();
    xhrINDIASPEND.onreadystatechange = function() {

        if (xhrINDIASPEND.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrINDIASPEND.responseText);

            // Add source
            for (var row in response) {
                response[row]["source"] = "IndiaSpend";
            }

            console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // Hindustan Times
    // http://airquality.hindustantimes.com/?city=Haldia

    // Aircasting
    // API https://github.com/HabitatMap/AirCasting/blob/master/doc/api.md

    // Open AQ
    // API https://docs.openaq.org/
    var xhrOAQ = new XMLHttpRequest();
    xhrOAQ.onreadystatechange = function() {

        if (xhrOAQ.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrOAQ.responseText).results;

            // Update properties
            for (var row in response) {
              try{
                response[row]["lat"] = response[row]["coordinates"]["latitude"];
                response[row]["lon"] = response[row]["coordinates"]["longitude"];
              }
              catch(e){
                response[row]["lat"] = 20;
                response[row]["lon"] = 20;
                console.log('Missing data',row,response[row]);

              }finally{
                response[row]["id"] = "";
                response[row]["aqi"] = response[row]["measurements"][0]["value"];
                response[row]["name"] = response[row]["city"];
                response[row]["source"] = "OAQ";
              }
            }

            // console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // India Open Data Association
    // API http://openenvironment.indiaopendata.com/#/openapi/#Public%20API
    var xhrIOD = new XMLHttpRequest();
    xhrIOD.onreadystatechange = function() {

        if (xhrIOD.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrIOD.responseText)[0];

            // Update properties
            for (var row in response) {
                response[row]["id"] = response[row]["deviceId"];
                response[row]["lat"] = response[row]["latitude"];
                response[row]["lon"] = response[row]["longitude"];
                response[row]["name"] = response[row]["label"];
                response[row]["source"] = response[row]["type"];
            }

            // console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // Update the feeds
    xhrOAQ.open('GET', 'https://api.openaq.org/v1/latest', true);
    xhrOAQ.send(null);

    xhrIOD.open('GET', 'http://api.airpollution.online/all/public/devices', true);
    xhrIOD.send(null);

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

            console.log(JSON.stringify(data));
            aqiDataLayer.setData(data);
        }

    }


});
