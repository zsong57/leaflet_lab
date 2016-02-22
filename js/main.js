var map = L.map('map').setView([14, 195], 3);
// add base map with tile layers from website
L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd', // I chose one of stamen design style
	minZoom: 2,
	maxZoom: 5, // set minimum and maximum scale zooms
	ext: 'png'
}).addTo(map);

	function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function createPropSymbols(data,map,attributes){
	
	//Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
	//create marker options
	console.log(attribute);
    var Options = {
        radius: 8,
        fillColor: "red",
        color: "red",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
    };
	

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //Step 6: Give each feature's circle marker a radius based on its attribute value
            Options.radius = calcPropRadius(attValue);
             
			 //create circle marker layer
           var layer = L.circleMarker(latlng, Options);
			
			
	 //original popupContent changed to panelContent
    var panelContent = "<p><b>Location:</b> " + feature.properties.Location + "</p>";
	//add formatted attribute to panel content string
    var year = attribute.split("_")[1];
	// add extra information
    panelContent += "<p><b>Time period: </b>" + attribute + "</p><p><b>Earthquake number: </b> " + feature.properties[attribute] + "</p>";
	

    //popup content is now just the city name
    var popupContent = feature.properties.Location;
	
    //bind the popup to the circle marker
	layer.bindPopup(popupContent, {
        offset: new L.Point(0,-Options.radius),
		closeButton: false
    });
            			 

    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
		 click: function(){
            $("#paneltext").html(panelContent);
        }
    });
						
    //create circle markers
return layer;	
return pointToLayer(feature, latlng, attributes);		
        }
    }).addTo(map);

};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
	//start with min at highest possible and max at lowest possible number
	var min = Infinity,
		max = -Infinity;

	map.eachLayer(function(layer){
		//get the attribute value
		if (layer.feature){
			var attributeValue = Number(layer.feature.properties[attribute]);

			//test for min
			if (attributeValue < min){
				min = attributeValue;
			};

			//test for max
			if (attributeValue > max){
				max = attributeValue;
			};
		};
	});

	//set mean
	var mean = (max + min) / 2;
	
	//return values as an object
	return {
		max: max,
		mean: mean,
		min: min
	};
};

//Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#paneltime').append('<input class="range-slider" type="range">');
	$('#paneltime').append('<button class="skip" id="reverse">Reverse</button>');
    $('#paneltime').append('<button class="skip" id="forward">Skip</button>');
	//replace button content with images
	$('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
	
	//set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
	
	//click listener for buttons
     $('.skip').click(function(){
		//get the old index value
		var index = $('.range-slider').val();

		//increment or decriment depending on button clicked
		if ($(this).attr('id') == 'forward'){
			index++;
			//if past the last attribute, wrap around to first attribute
			index = index > 6 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//if past the first attribute, wrap around to last attribute
			index = index < 0 ? 6 : index;
		};

		//update slider
		$('.range-slider').val(index);

		//pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});

	//input listener for slider
	$('.range-slider').on('input', function(){
		//get the new index value
		var index = $(this).val();

		//pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});
	
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//access feature properties
			var props = layer.feature.properties;
			
			//update each feature's radius based on new attribute values
			var	radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);

			createPopup(props, attribute, layer, radius);
		};
	});

};


function createPopup(properties, attribute, layer, radius){
	
	//add city to popup content string
	var popupContent = "<p><b>City:</b> " + properties.Location + "</p>";

	//replace the layer popup
	layer.bindPopup(popupContent, {
		offset: new L.Point(0,-radius),
		closeButton: false
	});
	
	 //original popupContent changed to panelContent
    var panelContent = "<p><b>Location:</b> " + properties.Location + "</p>";
	//add formatted attribute to panel content string
    var year = attribute.split("_")[1];
	// add extra information
    panelContent += "<p><b>Time period: </b>" + attribute + "</p><p><b>Earthquake number: </b> " + properties[attribute] + "</p>";
	
	layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
		 click: function(){
            $("#paneltext").html(panelContent);
        }
    });
	
};



//build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("From") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/lab1data.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
									
        }
    });
};

getData(map);