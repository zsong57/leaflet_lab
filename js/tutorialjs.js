/*Part1 Example from Leaflet Quick Start Guide*/
//  initialize the map and set its view to our chosen geographical coordinates and a zoom level



// add a marker to a certain location
var marker = L.marker([51.5, -0.09]).addTo(map);

// add a cirle to a certain location
var circle = L.circle([51.508, -0.11], 500, {
    color: 'red', // set color, opacity
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

// add a polygon, set its three points locations
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047] // set locations of three points
]).addTo(map);

 // add three popups to marker, circle and polygon
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// add a stand alone popup. Openon here can automaticly close of a previously opened popup when opening a new one.
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("Try clicking on cities to show population!")
    .openOn(map);
	

// build a onMapClick function: when clicking on the map, there will be a popup showing location 
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map); 
}
// add click function to map
map.on('click', onMapClick);


/*Part2 Example from Using GeoJSON with Leaflet Guide*/
//build  a simple GeoJSON feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
// add this feature to map
L.geoJson(geojsonFeature).addTo(map);
// build two lines, GeoJSON objects may also be passed as an array of valid GeoJSON objects.
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];


// define a style
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
// set polylines as myStyle
L.geoJson(myLines, {
    style: myStyle
}).addTo(map);

//check the "party" property and style our polygons accordingly:
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
// if find some specific features, change their colors
L.geoJson(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

// add a marker
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
// define some simple features
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];
// let features show on the map
L.geoJson(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);

