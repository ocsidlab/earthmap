/*

How the Earth map works

1. Find an API or endpoint providing a live feed of field sensing devices that capture air pollution, temperature, humidity or other interesting probe values
2. Write ana AJAX request to query the feed either on map load or at each map movement
3. Remap the sensor values to a standard json format as defined in X
4. Send the feed to updateDataLayer() with the layer name and the data to update
 - This will first purge any existing data on the map from the same feed source
 - The json feed is converted to a geojson
 - And then append the new data from the feed to the aggregated store to visualize on the map

*/

// Add a map
mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/planemad/cio8y8afz0033b3nfh3ipli4i', //stylesheet location
    hash: true,
    zoom: 4,
    center: [79.0806091, 21.1498041],
    pitch: 30
});

// Add geocoder
map.addControl(new mapboxgl.Geocoder({
    'position': 'top-right'
}));


map.on('style.load', function(e) {

    // Add AQI source and layers
    map.addSource('aqi', {
        'type': 'geojson',
        'data': {
            "type": "FeatureCollection",
            "features": []
        }
    });

    // The AQI style layer
    map.addLayer({
        "id": "aqi-color",
        "type": "circle",
        "source": "aqi",
        "filter": [
            ">",
            "aqi",
            0
        ],
        "paint": {
            "circle-color": {
                property: 'aqi',
                stops: [
                    [0, 'rgb(198, 243, 255)'],
                    [10, 'rgb(82, 237, 247)'],
                    [40, 'rgb(136, 250, 126)'],
                    [100, '#e6e05e'],
                    [200, '#e55e5e'],
                    [300, '#ff0000'],
                    [500, '#e51df0']
                ]
            },
            "circle-blur": 2,
            "circle-radius": {
                property: 'aqi',
                stops: [
                    [0, 5],
                    [200, 10],
                    [400, 20]
                ]
            },
        }
    });
    map.addLayer({
        "id": "aqi",
        "type": "circle",
        "source": "aqi",
        "paint": {
            "circle-color": "white",
            "circle-radius": 1,
            "circle-blur": 1
        }
    });
    map.addLayer({
        "id": "aqi-labels",
        "type": "symbol",
        "source": "aqi",
        "minzoom": 10,
        "paint": {
            "text-halo-color": "black",
            "text-halo-width": 1,
            "text-halo-blur": 3,
            "text-color": "yellow"
        },
        "layout": {
            "text-field": "AQI: {aqi}",
            "text-size": {
                "stops": [
                    [12, 8],
                    [18, 16]
                ]
            }
        }
    });

    // Global store for air quality data feed
    var airQuality = [];

    // aqicn.org
    var xhrAQICN = new XMLHttpRequest();
    xhrAQICN.onreadystatechange = function() {

        if (xhrAQICN.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrAQICN.responseText);

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

            // console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // Hindustan Times
    // http://airquality.hindustantimes.com/?city=Haldia

    var xhrHINDUSTANTIMES = new XMLHttpRequest();
    xhrHINDUSTANTIMES.onreadystatechange = function() {

        if (xhrHINDUSTANTIMES.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrHINDUSTANTIMES.responseText).reports;

            // Add source
            for (var row in response) {
              response[row]["aqi"] = response[row].recent.aqi;
              response[row]["name"] = response[row].station.location;
              response[row]["lat"] = response[row].station.geo.coordinates[1];
              response[row]["lon"] = response[row].station.geo.coordinates[0];
              response[row]["source"] = response[row].station.source;
            }

            console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

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
                try {
                    response[row]["lat"] = response[row]["coordinates"]["latitude"];
                    response[row]["lon"] = response[row]["coordinates"]["longitude"];
                } catch (e) {
                    response[row]["lat"] = 0;
                    response[row]["lon"] = 0;
                    console.log('Missing coordinates', row, response[row]);

                } finally {
                    response[row]["id"] = "";
                    response[row]["aqi"] = response[row]["measurements"][0]["value"];
                    response[row]["name"] = response[row]["city"];
                    response[row]["source"] = "OAQ";
                    response[row]["aqi"] = response[row]["measurements"][0]["value"];
                    // Calculate AQI for each measurement
                    for (var i in response[row]["measurements"]) {
                        response[row]["aqi"] = -1;
                        switch (response[row]["measurements"][i]["parameter"]) {
                            case "pm10":
                                response[row]["measurements"][i]["aqi"] = AQIPM10(response[row]["measurements"][i]["value"]);
                                break;
                            case "pm25":
                                response[row]["measurements"][i]["aqi"] = AQIPM25(response[row]["measurements"][i]["value"]);
                                break;
                            case "o3":
                                response[row]["measurements"][i]["aqi"] = AQIOzone8hr(response[row]["measurements"][i]["value"]);
                                break;
                            case "no2":
                                response[row]["measurements"][i]["aqi"] = AQINO2(response[row]["measurements"][i]["value"]);
                                break;
                            case "so2":
                                response[row]["measurements"][i]["aqi"] = AQISO224hr(response[row]["measurements"][i]["value"]);
                                break;
                            case "co":
                                response[row]["measurements"][i]["aqi"] = AQICO(response[row]["measurements"][i]["value"]);
                                break;
                            default:
                                response[row]["measurements"][i]["aqi"] = -1;
                        }
                        // Measure overall AQI by picking maximum
                        response[row]["aqi"] = Math.max(response[row]["aqi"], response[row]["measurements"][i]["aqi"]);
                    }

                }
            }

            // console.log(response);

            // Update the data
            updateDataLayer("aqi", response);

        }
    }

    // India Open Data Association
    // API https://market.mashape.com/sohil4932/open-environment-data-project
    var xhrIOD = new XMLHttpRequest();
    xhrIOD.onreadystatechange = function() {

        if (xhrIOD.readyState == XMLHttpRequest.DONE) {

            var response = JSON.parse(xhrIOD.responseText);

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

    // Fetch the air quality data feeds

    xhrOAQ.open('GET', 'https://api.openaq.org/v1/latest?limit=5000', true);
    xhrOAQ.send({
        limit: 500
    });

    xhrIOD.open('GET', 'https://openenvironment.p.mashape.com/all/public/devices', true);
    xhrIOD.setRequestHeader("X-Mashape-Key", '2l1wjDc9AfmshNynxyNBTtLu05m8p1wccaxjsnYFaKi1uKDBdb');
    xhrIOD.setRequestHeader("Accept", 'application/json');
    xhrIOD.send(null);

    xhrHINDUSTANTIMES.open('GET', 'http://airquality.hindustantimes.com/widget/map/data', true);
    xhrHINDUSTANTIMES.send(null);

    xhrINDIASPEND.open('GET', 'http://aqi.indiaspend.org/aq/api/aqfeed/latestAll/?format=json', true);
    xhrINDIASPEND.send(null);

    map.on('moveend', function(e) {
        var xhrAQICNBounds = map.getBounds()._sw.lat + ',' + +map.getBounds()._sw.lng + '),(' + map.getBounds()._ne.lat + ',' + map.getBounds()._ne.lng;
        xhrAQICN.open('GET', 'https://api.waqi.info/mapq/bounds/?bounds=' + xhrAQICNBounds + '&inc=placeholders&k=_2Y2EzVx9mCVkcHT8IS0lWXmldZEU+PSdRFWgjLQ==&_=' + Date.now(), true);
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

            // Convert JSON data to GeoJSON
            GeoJSON.parse(airQuality, {
                Point: ['lat', 'lon'],
                include: ['id', 'name', 'measurements', 'aqi', 'source', 'time']
            }, function(geojson) {
                // console.log(airQuality); // JSON
                // console.log(JSON.stringify(geojson)); //GeoJSON
                console.log("AQI dump:", geojson);
                map.getSource('aqi').setData(geojson);
            });
        }
    }

});

// Details on click
map.on('click', function(e) {

    // Popups from AQI layers
    // Show popup of feature from an OSM layer
    var features = map.queryRenderedFeatures([
        [e.point.x - 3, e.point.y - 3],
        [e.point.x + 3, e.point.y + 3]
    ], {
        layers: ['aqi']
    })

    if (features.length) {
        var popupHTML = "<strong>" + features[0]["properties"]["name"] + "</strong><br>";
        popupHTML += "<span class='aqi'>" + features[0]["properties"]["aqi"] + "</span> <a href=''>Air Quality Index</a><br>";
        popupHTML += "Source: " + features[0]["properties"]["source"];

        var popup = new mapboxgl.Popup()
            .setLngLat(features[0].geometry.coordinates)
            .setHTML(popupHTML)
            .addTo(map);
    }

})

// Particle measurement -> AQI calculator for openaq data
// https://airnow.gov/index.cfm?action=resources.conc_aqi_calc

function Linear(AQIhigh, AQIlow, Conchigh, Conclow, Concentration) {
    var linear;
    var Conc = parseFloat(Concentration);
    var a;
    a = ((Conc - Conclow) / (Conchigh - Conclow)) * (AQIhigh - AQIlow) + AQIlow;
    linear = Math.round(a);
    return linear;
}

function AQIPM25(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = (Math.floor(10 * Conc)) / 10;
    if (c >= 0 && c < 12.1) {
        AQI = Linear(50, 0, 12, 0, c);
    } else if (c >= 12.1 && c < 35.5) {
        AQI = Linear(100, 51, 35.4, 12.1, c);
    } else if (c >= 35.5 && c < 55.5) {
        AQI = Linear(150, 101, 55.4, 35.5, c);
    } else if (c >= 55.5 && c < 150.5) {
        AQI = Linear(200, 151, 150.4, 55.5, c);
    } else if (c >= 150.5 && c < 250.5) {
        AQI = Linear(300, 201, 250.4, 150.5, c);
    } else if (c >= 250.5 && c < 350.5) {
        AQI = Linear(400, 301, 350.4, 250.5, c);
    } else if (c >= 350.5 && c < 500.5) {
        AQI = Linear(500, 401, 500.4, 350.5, c);
    } else {
        AQI = -1;
    }
    return AQI;
}
//line63
function AQIPM10(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = Math.floor(Conc);
    if (c >= 0 && c < 55) {
        AQI = Linear(50, 0, 54, 0, c);
    } else if (c >= 55 && c < 155) {
        AQI = Linear(100, 51, 154, 55, c);
    } else if (c >= 155 && c < 255) {
        AQI = Linear(150, 101, 254, 155, c);
    } else if (c >= 255 && c < 355) {
        AQI = Linear(200, 151, 354, 255, c);
    } else if (c >= 355 && c < 425) {
        AQI = Linear(300, 201, 424, 355, c);
    } else if (c >= 425 && c < 505) {
        AQI = Linear(400, 301, 504, 425, c);
    } else if (c >= 505 && c < 605) {
        AQI = Linear(500, 401, 604, 505, c);
    } else {
        AQI = -1;
    }
    return AQI;
}
//line104
function AQICO(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = (Math.floor(10 * Conc)) / 10;
    if (c >= 0 && c < 4.5) {
        AQI = Linear(50, 0, 4.4, 0, c);
    } else if (c >= 4.5 && c < 9.5) {
        AQI = Linear(100, 51, 9.4, 4.5, c);
    } else if (c >= 9.5 && c < 12.5) {
        AQI = Linear(150, 101, 12.4, 9.5, c);
    } else if (c >= 12.5 && c < 15.5) {
        AQI = Linear(200, 151, 15.4, 12.5, c);
    } else if (c >= 15.5 && c < 30.5) {
        AQI = Linear(300, 201, 30.4, 15.5, c);
    } else if (c >= 30.5 && c < 40.5) {
        AQI = Linear(400, 301, 40.4, 30.5, c);
    } else if (c >= 40.5 && c < 50.5) {
        AQI = Linear(500, 401, 50.4, 40.5, c);
    } else {
        AQI = -1;
    }
    return AQI;
}
//line145
function AQISO21hr(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = Math.floor(Conc);
    if (c >= 0 && c < 36) {
        AQI = Linear(50, 0, 35, 0, c);
    } else if (c >= 36 && c < 76) {
        AQI = Linear(100, 51, 75, 36, c);
    } else if (c >= 76 && c < 186) {
        AQI = Linear(150, 101, 185, 76, c);
    } else if (c >= 186 && c <= 304) {
        AQI = Linear(200, 151, 304, 186, c);
    } else if (c >= 304 && c <= 604) {
        AQI = "SO21hrmessage";
    } else {
        AQI = -1;
    }
    return AQI;
}

function AQISO224hr(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = Math.floor(Conc);
    if (c >= 0 && c <= 304) {
        AQI = "SO224hrmessage";
    } else if (c >= 304 && c < 605) {
        AQI = Linear(300, 201, 604, 305, c);
    } else if (c >= 605 && c < 805) {
        AQI = Linear(400, 301, 804, 605, c);
    } else if (c >= 805 && c <= 1004) {
        AQI = Linear(500, 401, 1004, 805, c);
    } else {
        AQI = -1;
    }
    return AQI;
}
//line186
function AQIOzone8hr(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = (Math.floor(Conc)) / 1000;

    if (c >= 0 && c < .060) {
        AQI = Linear(50, 0, 0.059, 0, c);
    } else if (c >= .060 && c < .076) {
        AQI = Linear(100, 51, .075, .060, c);
    } else if (c >= .076 && c < .096) {
        AQI = Linear(150, 101, .095, .076, c);
    } else if (c >= .096 && c < .116) {
        AQI = Linear(200, 151, .115, .096, c);
    } else if (c >= .116 && c < .375) {
        AQI = Linear(300, 201, .374, .116, c);
    } else if (c >= .375 && c < .605) {
        AQI = "O3message";
    } else {
        AQI = -1;
    }
    return AQI;
}
//line219

function AQIOzone1hr(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = (Math.floor(Conc)) / 1000;
    if (c >= .125 && c < .165) {
        AQI = Linear(150, 101, .164, .125, c);
    } else if (c >= .165 && c < .205) {
        AQI = Linear(200, 151, .204, .165, c);
    } else if (c >= .205 && c < .405) {
        AQI = Linear(300, 201, .404, .205, c);
    } else if (c >= .405 && c < .505) {
        AQI = Linear(400, 301, .504, .405, c);
    } else if (c >= .505 && c < .605) {


        AQI = Linear(500, 401, .604, .505, c);
    } else {
        AQI = -1;
    }
    return AQI;
}

function AQINO2(Concentration) {
    var Conc = parseFloat(Concentration);
    var c;
    var AQI;
    c = (Math.floor(Conc)) / 1000;
    if (c >= 0 && c < .054) {
        AQI = Linear(50, 0, .053, 0, c);
    } else if (c >= .054 && c < .101) {
        AQI = Linear(100, 51, .100, .054, c);
    } else if (c >= .101 && c < .361) {
        AQI = Linear(150, 101, .360, .101, c);
    } else if (c >= .361 && c < .650) {
        AQI = Linear(200, 151, .649, .361, c);
    } else if (c >= .650 && c < 1.250) {
        AQI = Linear(300, 201, 1.249, .650, c);
    } else if (c >= 1.250 && c < 1.650) {
        AQI = Linear(400, 301, 1.649, 1.250, c);
    } else if (c >= 1.650 && c <= 2.049) {
        AQI = Linear(500, 401, 2.049, 1.650, c);
    } else {
        AQI = -1;
    }
    return AQI;
}

function AQICategory(AQIndex) {
    var AQI = parseFloat(AQIndex)
    var AQICategory;
    if (AQI <= 50) {
        AQICategory = "Good";
    } else if (AQI > 50 && AQI <= 100) {
        AQICategory = "Moderate";
    } else if (AQI > 100 && AQI <= 150) {
        AQICategory = "Unhealthy for Sensitive Groups";
    } else if (AQI > 150 && AQI <= 200) {
        AQICategory = "Unhealthy";
    } else if (AQI > 200 && AQI <= 300) {
        AQICategory = "Very Unhealthy";
    } else if (AQI > 300 && AQI <= 400) {
        AQICategory = "Hazardous";
    } else if (AQI > 400 && AQI <= 500) {
        AQICategory = "Hazardous";
    } else {
        AQICategory = -1;
    }
    return AQICategory;
}
