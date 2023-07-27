// Function to create the Leaflet map
function createMap() {
  var map = L.map('map').setView([39.8097343, -98.5556199], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
  return map;
}

//Format for building losses
function formatToMoney(number) {
  return Number(number).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

// Select popup blurb based on selection
function updatePopupContent(feature, layer, selectedOption) {
  var popupContent = '';
  if (selectedOption === 'Tornado') {
    popupContent = `
      <strong>County:</strong> ${feature.properties.COUNTY}<br>
      <strong>Population:</strong> ${feature.properties.POPULATION}<br>
      <strong>Expected Annual Loss of Building Value ($):</strong> ${formatToMoney(feature.properties.TRND_expected_loss_building)}<br>
      <strong>FEMA Annual loss Rating:</strong> ${feature.properties.TRND_expected_loss_rating}<br>
    `;
  } else if (selectedOption === 'Wildfire') {
    popupContent = `
      <strong>County:</strong> ${feature.properties.COUNTY}<br>
      <strong>Population:</strong> ${feature.properties.POPULATION}<br>
      <strong>Expected Annual Loss of Building Value ($):</strong> ${formatToMoney(feature.properties.WFIR_expected_loss_building)}<br>
      <strong>FEMA Annual loss Rating:</strong> ${feature.properties.WFIR_expected_loss_rating}<br>
    `;
  } else if (selectedOption === 'Hail') {
    popupContent = `
      <strong>County:</strong> ${feature.properties.COUNTY}<br>
      <strong>Population:</strong> ${feature.properties.POPULATION}<br>
      <strong>Expected Annual Loss of Building Value ($):</strong> ${formatToMoney(feature.properties.HAIL_expected_loss_building)}<br>
      <strong>FEMA Annual loss Rating:</strong> ${feature.properties.HAIL_expected_loss_rating}<br>
    `;
  } else if (selectedOption === 'Hurricane') {
    popupContent = `
      <strong>County:</strong> ${feature.properties.COUNTY}<br>
      <strong>Population:</strong> ${feature.properties.POPULATION}<br>
      <strong>Expected Annual Loss of Building Value ($):</strong> ${formatToMoney(feature.properties.HRCN_expected_loss_building)}<br>
      <strong>FEMA Annual loss Rating:</strong> ${feature.properties.HRCN_expected_loss_rating}<br>
    `;
  } else if (selectedOption === 'Earthquake') {
    popupContent = `
      <strong>County:</strong> ${feature.properties.COUNTY}<br>
      <strong>Population:</strong> ${feature.properties.POPULATION}<br>
      <strong>Expected Annual Loss of Building Value ($):</strong> ${formatToMoney(feature.properties.ERQK_expected_loss_building)}<br>
      <strong>FEMA Annual loss Rating:</strong> ${feature.properties.ERQK_expected_loss_rating}<br>
    `;
  }

  layer.bindPopup(popupContent);
}

// function to get proper loss_rating for styling
function getColorFromCode(color_code) {
  switch (color_code) {
    case 'insufficient data':
      return 'gray';
    case 'No Expected Annual Losses':
      return 'darkgreen';
    case 'Relatively High':
      return 'red';
    case 'Relatively Low':
      return 'blue';
    case 'Relatively Moderate':
      return 'orange';
    case 'Very High':
      return 'darkred';
    case 'Very Low':
      return 'lightgreen';
    default:
      return 'gray'; // Default color for unknown or unexpected ratings
  }
}


// Function to load and plot the GeoJSON data with selected option
function loadAndPlotGeoJSON(map) {
  // Get the dropdown element
  var dropdown = document.getElementById('dropdown');
  var selectedOption = dropdown.value; // Get the initial selected option

  // get proper column selected for styling and set color
function getStyle(feature) {
  if (selectedOption === 'Tornado') {
    color_code = feature.properties.TRND_expected_loss_rating; // Set color_code for Tornado
    return { color: getColorFromCode(color_code), opacity: 0.7 };
  } else if (selectedOption === 'Wildfire') {
    color_code = feature.properties.WFIR_expected_loss_rating; // Set color_code for Wildfire
    return { color: getColorFromCode(color_code) };
  } else if (selectedOption === 'Hail') {
    color_code = feature.properties.HAIL_expected_loss_rating; // Set color_code for Hail
    return { color: getColorFromCode(color_code) };
  } else if (selectedOption === 'Hurricane') {
    color_code = feature.properties.HRCN_expected_loss_rating; // Set color_code for Hurricane
    return { color: getColorFromCode(color_code) };
  } else if (selectedOption === 'Earthquake') {
    color_code = feature.properties.ERQK_expected_loss_rating; // Set color_code for Earthquake
    return { color: getColorFromCode(color_code) };
  }
}
  // 'fetch' geojson data from call
  fetch('/geojson_data')
    // parse out json data
    .then(response => response.json())
    .then(geojsonData => {
      const filteredGeojsonData = {
        type: 'FeatureCollection',
        features: geojsonData.features.filter(feature => {
          const statefp = feature.properties.STATEFP;
          return statefp !== '02' && statefp !== '72';
        })
      };
      // plot geojson data using leaflet L.geojson
      L.geoJSON(filteredGeojsonData, {
        onEachFeature: function (feature, layer) {
          // Popup with feature name
          updatePopupContent(feature, layer, selectedOption); // Set the initial popup content

          // Add an event listener to the dropdown to update popup content
          dropdown.addEventListener('change', function () {
            selectedOption = dropdown.value;
            updatePopupContent(feature, layer, selectedOption);
            layer.setStyle(getStyle(feature));
          });
          layer.setStyle(getStyle(feature));
        }
      }).addTo(map);
    }) 
    .catch(error => console.error('Error fetching GeoJSON:', error));
}

// Create the map and plot GeoJSON data
var map = createMap();
loadAndPlotGeoJSON(map);
