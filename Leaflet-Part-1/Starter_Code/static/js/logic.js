const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

// Define color scale for magnitude
const magnitudeColors = ['#8f0', '#ee0', '#eb0', '#e80', '#b60', '#a00'];
const magnitudeThresholds = [0, 1, 2.5, 4, 5, 6];

const getFillColor = magnitude => {
    for (let i = magnitudeThresholds.length - 1; i >= 0; i--) {
        if (magnitude >= magnitudeThresholds[i]) {
            return magnitudeColors[i];
        }
    }
    return '#ccc'; // Default color if no match
};

const getRadius = magnitude => {
    if (magnitude === 0) {
        return 1; // Minimum visible radius
    }
    return magnitude * 3; // Adjust scaling factor if needed
};

const createMarkers = (earthquakeData, myMap) => {
    L.geoJSON(earthquakeData.features, {
        pointToLayer: (feature, latlng) => {
            const magnitude = feature.properties.mag;

            const markerOptions = {
                opacity: 1,
                fillOpacity: 0.65,
                color: 'black',
                weight: 0.3,
                fillColor: getFillColor(magnitude),
                radius: getRadius(magnitude)
            };

            return L.circleMarker(latlng, markerOptions);
        },
        onEachFeature: (feature, layer) => {
            const depth = feature.geometry.coordinates[2];
            const latLng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
            const magnitude = feature.properties.mag;
            const place = feature.properties.place;
            const time = feature.properties.time;
            layer.bindPopup(`<strong>Magnitude ${magnitude} -- ${place}</strong><br><hr>Latitude: ${latLng[0].toFixed(3)}, Longitude: ${latLng[1].toFixed(3)}<br>Depth: ${depth.toFixed(2)} km<br>Time: ${new Date(time)}`).addTo(myMap);
        }
    }).addTo(myMap);
};

const createLegend = myMap => {
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'legend');
        div.style.cssText = 'background-color: white; margin-left: 0px; padding: 0px 10px 0px 0px; border-radius: 5px;';

        let legendHTMLString = "<ul style=\"list-style-type: none; padding-left: 10px;\">";
        magnitudeColors.forEach((color, index) => {
            const range = index === 0 ? '< 1' : index === magnitudeColors.length - 1 ? '6+' : `${magnitudeThresholds[index]}-${magnitudeThresholds[index+1]}`;
            legendHTMLString += `<li><span style=\"background-color: ${color};\">&emsp;</span> ${range}</li>`;
        });
        legendHTMLString += "</ul>";

        div.innerHTML = legendHTMLString;
        return div;
    };

    legend.addTo(myMap);
};

const createMap = earthquakeData => {
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street]
    });

    createMarkers(earthquakeData, myMap);
    createLegend(myMap);
};

d3.json(url).then(createMap);
