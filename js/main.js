var black   = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd', // I chose one of stamen design style
	minZoom: 2,
	maxZoom: 5, // set minimum and maximum scale zooms
	ext: 'png'
}),

terrain = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
	type: 'sat',
	ext: 'jpg',
	minZoom: 2,
	maxZoom: 5,
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
	subdomains: '1234'
});

getOverlaydata(map);

var map = L.map('map', {
    center: [25, 195],
    zoom: 3,
    layers: [black]
});


function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 40;
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
	
    var Options = {
     
        fillColor: "red",
        color: "red",
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
    var panelContent = "<p><b>Location:</b><span class = 'LocationName'>" + feature.properties.Location + "</span></p>";  
	// add extra information
    panelContent += "<p><b>Time period: </b>" + attribute + "</p><p><b>Number of earthquakes: </b> " + feature.properties[attribute] + "</p>";
	
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
			this.setStyle({fillColor: "gray"});
			this.setStyle({color: "gray"});
        },
        mouseout: function(){
            this.closePopup();
			this.setStyle({fillColor: "red"});
			this.setStyle({color: "red"});
        },
		 click: function(){
            $("#paneltext").html(panelContent);
        }
    });
						
    //create circle markers
return layer;	
		
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

function createLegend(map, attributes){
	var LegendControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},

		onAdd: function (map) {
			// create the control container with a particular class name
			var container = L.DomUtil.create('div', 'legend-control-container');

			//add temporal legend div to container
			$(container).append('<div id="temporal-legend">')

			//start attribute legend svg string
			var svg = '<svg id="attribute-legend" width="300px" height="260px">';

			//array to base loop on
			var circles = {
				max: 60,
				mean: 140,
				min: 220
			};

			//loop to add each circle and text to svg string
			for (var circle in circles){
				//circle string
				svg += '<circle class="legend-circle" id="' + circle + '" fill="red" fill-opacity="0.3"  cx="180"/>';

				//text string
				svg += '<text id="' + circle + '-text" x="20" y="' + circles[circle] + '"></text>';
			};

			//close svg string
			svg += "</svg>";

			//add attribute legend svg to container
			$(container).append(svg);

			return container;
		}
	});

	map.addControl(new LegendControl());

	updateLegend(map, attributes[0]);
};



//Create new sequence controls
function createSequenceControls(map, attributes){
	var SequenceControl = L.Control.extend({
		options: {
			position: 'bottomleft'
		},

		onAdd: function (map) {
			// create the control container with a particular class name
			var container = L.DomUtil.create('div', 'sequence-control-container');

			//create range input element (slider)
			$(container).append('<input class="range-slider" type="range">');

			//add skip buttons
			$(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
			$(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

			//kill any mouse event listeners on the map
			$(container).on('mousedown dblclick', function(e){
				L.DomEvent.stopPropagation(e);
			});

			return container;
		}
	});

map.addControl(new SequenceControl());
	
	//set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
	
	//replace button content with images
$('#reverse').html('<img src="img/reverse.png">');
$('#forward').html('<img src="img/forward.png">');	
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
	var props;
	var currentLayer;
	map.eachLayer(function(layer){
		currentLayer = layer;
		// each proportional symbol is a layer, including basemap.
		if (layer.feature && layer.feature.properties[attribute]){
			
			//access feature properties
			props = layer.feature.properties;
			
			//update each feature's radius based on new attribute values
			var	radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);

			updatePanel(props, attribute, layer);
						
		};
	});
	updateLegend(map, attribute);
};

function updateLegend(map, attribute){
	//create content for legend
	
	var content = attribute;

	//replace legend content
	$('#temporal-legend').html(content);

	var circleValues = getCircleValues(map, attribute);

	for (var key in circleValues){
		//get the radius
		var radius = calcPropRadius(circleValues[key]);

		$('#'+key).attr({
			cy: 250 - radius,
			r: radius
		});

		$('#'+key+'-text').text(Math.round(circleValues[key]));
	};
};

function updatePanel(properties, attribute, layer){
	 //original popupContent changed to panelContent
	
	
    var panelContent = "<p><b>Location:</b><span class = 'LocationName'>" + properties.Location + "</span></p>";
	// add extra information
    panelContent += "<p><b>Time period: </b>" + attribute + "</p><p><b>Number of earthquakes: </b> " + properties[attribute] + "</p>";
	
	if (properties.Location == $(".LocationName").html())
	{
	$("#paneltext").html(panelContent);	
	
	};
	
	layer.on({
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
			createLegend(map, attributes);
									
        }
    });
};
getData(map);


function getOverlaydata(map){
    //load the data
$.ajax("data/overlaydata.geojson", {
        dataType: "json",
        success: function(response){
            createOverlaydata(response);			
        }
    });


};


function createOverlaydata(data){
	
var Options = {
        radius: 1.5,
        fillColor: "rgb(90, 0, 0)",
        color: "rgb(90, 0, 0)",
        opacity: 1,
        fillOpacity: 0.9,
    };
var locations = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
                       
	    //create circle marker layer
           var overlayerr = L.circleMarker(latlng, Options);
           
		 return overlayerr;
		}
});


var baseMaps = {
	"Blackmap": black,
    "Terrainmap": terrain
};

var overlayMaps = {
    "Individual earthquake": locations
};

L.control.layers(baseMaps,overlayMaps).addTo(map);
};
