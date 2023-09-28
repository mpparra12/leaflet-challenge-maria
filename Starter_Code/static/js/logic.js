
// URL to retrieve earthquake data
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Colors for different earthquake depths
const depthColors = ['#8f0', '#ee0', '#eb0', '#e80', '#b60', '#a00'];


// Function to create a marker in association with each earthqake data point of an array
// of data points passed in as the first argument and then, these markers are added to 
// the map passed in as the second argument.
function createMarkers(earthquakeData, myMap) {

    // Create a geoJSON layer to add markers to map.
    L.geoJSON(earthquakeData.features, {

        // Use the pointToLayer option of a geoJSON layer to create a 
        // circleMarker with a radius that's proportional to the 
        // magnitude of the earthquake and has a color that corresponds 
        // to a particular depth range (in km). (It also sets an 
        // opacity, fillOpacity, and wieght that are constant across 
        // all markers).
        pointToLayer: function(feature, latlng){
            let depth = feature.geometry.coordinates[2];
            let magnitude = feature.properties.mag;

            let fillColor1 = "";
            if (depth > 90){
                fillColor1 = depthColors[5];
            } else if (depth > 70){
                fillColor1 = depthColors[4];
            } else if (depth > 50){
                fillColor1 = depthColors[3];
            } else if (depth > 30){
                fillColor1 = depthColors[2];
            } else if (depth > 10){
                fillColor1 = depthColors[1];
            } else {
                fillColor1 = depthColors[0];
            }
            
            markerOptions = {
                opacity: 1,
                fillOpacity: 0.65,
                color: 'black',
                weight: .3,
                fillColor: fillColor1,
                radius: magnitude * 3 
            };
            return L.circleMarker(latlng, markerOptions);
        },

        // Use the onEachFeature option of a geoJSON layer to bind a
        // popup tag/box for each marker that displays the information
        // specific to that marker such as maginitude, depth, location,
        // place, and time.
        onEachFeature: function(feature, layer){
            let depth = feature.geometry.coordinates[2];
            let latLng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
            let magnitude = feature.properties.mag;
            let place = feature.properties.place;
            let time = feature.properties.time;
            layer.bindPopup(`<strong>Magnitude ${magnitude} -- ${place}</strong><br><hr>Latitude: ${latLng[0].toFixed(3)}, Longitude: ${latLng[1].toFixed(3)}<br>Depth: ${depth.toFixed(2)} km<br>Time: ${new Date(time)}`).addTo(myMap);
        }
    }).addTo(myMap);
  }


  // Function to create and add a legend to a map passed in as an argument where that legend
  // provides an association between colors of markers and depth of the earthquake that is 
  // associated with that given marker.
  function createLegend(myMap){
    // Create L.Control object for the legend
    let legend = L.control({position: 'bottomright'});

    // Implementing .onAdd method for the L.Control object
    legend.onAdd = function() {
        // Create a div to conatain the legend
        let div = L.DomUtil.create('div', 'legend');

        // Style the legend-div with a white background, a margin that is aesthetically appealling
        // (subjectively, of course), and round the corners of the div
        div.setAttribute('style', 'background-color: white; margin-left: 0px; padding: 0px 10px 0px 0px; border-radius: 5px;');
        let labels = [];


        // Create a string filled with html code to construct the legend-- primarily relying on a
        // unordered list and its elements
        let legendHTMLString = "<ul style=\"list-style-type: none; padding-left: 10px;\">";
        for (let i = 0; i < depthColors.length; i++){
            if (i == 0){
                legendHTMLString += `<li><span style=\"background-color: ${depthColors[i]};\">&emsp;</span> < 10</li>`;
            } else if (i == depthColors.length - 1){
                legendHTMLString += `<li><span style=\"background-color: ${depthColors[i]};\">&emsp;</span> 90+</li>`;
            } else {
                legendHTMLString += `<li><span style=\"background-color: ${depthColors[i]};\">&emsp;</span> ${i * 20 - 10}-${i * 20 + 10}</li>`;
            }
        }

        legendHTMLString += "</ul>";

        // Implement the string as html code
        div.innerHTML = legendHTMLString;

        // Return the fabricated div tag
        return div;
    }

    // Add the legend to the map
    legend.addTo(myMap);
  }
  
  
  // Function to create L.Map object that adds markers corresponds to earthquake data
  // passed in as its only argument and adds a legend for various marker colors that
  // correspond to the earthquake depth associated with a given marker.
  function createMap(earthquakeData) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street]
    });

    // Create and add the markers to the map
    createMarkers(earthquakeData, myMap);

    // Create and the markers to the map
    createLegend(myMap);
  }

// Retrieve the earthquake data and create the map from the earthquake data
d3.json(url).then(createMap);