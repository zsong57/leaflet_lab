/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
// call the functions
getData(map);
onEachFeature();

//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};



//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
			 //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
			// I made a slight change here: add popup to markers. So after I clicking on the cirles, there will be labels pop up!		
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
				// there are two keys: one is to add "onEachFeature" for adding popup, the other is to apply the style to each locaton
                }, onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
};

