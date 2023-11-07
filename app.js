/**
 * GOAL: This script handles the initialization and interaction with a Google Map instance.
 * The map integrates multiple GeoJSON layers and provides functionality for selecting
 * zones, fetching places within those zones, and applying filters to the displayed places.
 */

/**
 *  Configuration for the various GeoJSON layers available in the application
 *  CREATING A GEOJSON FILE: https://www.youtube.com/watch?v=QbmKn7xZmR4
 */
const layersConfig = [
  {
    id: "boroughBoundaries",
    name: "Borough_Boundaries",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Borough_Boundaries.geojson" 
      || "Luegle/NYC_GeoJSON_Data/Borough_Boundaries.geojson",
    active: false,
  },
  {
    id: "cityCouncilDistricts",
    name: "City_Council_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/City_Council_Districts.geojson"
      || "Luegle/NYC_GeoJSON_Data/City_Council_Districts.geojson",
    active: false,
  },
  {
    id: "communityDistricts",
    name: "Community_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Community_Districts.geojson"
      || "Luegle/NYC_GeoJSON_Data/Community_Districts.geojson",
    active: false,
  },
  {
    id: "congressionalDistricts",
    name: "Congressional_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Congressional_Districts.geojson"
      || "Luegle/NYC_GeoJSON_Data/Congressional_Districts.geojson",
    active: false,
  },
  {
    id: "electionDistricts",
    name: "Election_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Election_Districts.geojson"
      || "Luegle/NYC_GeoJSON_Data/Election_Districts.geojson",
    active: true,
  },
  {
    id: "policeDistricts",
    name: "Police_Precincts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Police_Precincts.geojson"
      || "Luegle/NYC_GeoJSON_Data/Police_Precincts.geojson",
    active: false,
  },
  {
    id: "schoolDistricts",
    name: "School_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/School_Districts.geojson"
      || "Luegle/NYC_GeoJSON_Data/School_Districts.geojson",
    active: false,
  },
];

// Object to track the selected zones on the map
let selectedZones = {};

// Global map object
let map;

// Store the GeoJSON features
let geoJsonFeatures = {};

//Store the Coordinates of a selected zone, using the zone as the key
let selectedZoneCoords = {};

//Store the boundary box of a selected zone, using the zone as the key
let selectedZoneBBOX = {};

//Store the filtered Places within in each zone
let placesWithinSelectedZone = {}

//Store all markers posted on the map
let markersArray = []

//Store all searches
let searchHistory = []

/**
 * Initializes the Google Map instance, centers it at the specified coordinates,
 * and loads the active GeoJSON layers.
 * Default map location is Chelsea, NYC.
 * For Guidance: //https://developers.google.com/maps/documentation/javascript/controls
 */
async function initMap() {

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  map = new Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
    mapId: "Luegle-main",
    zIndex: 1,
    disableDefaultUI: true,
  });

  // Load GeoJSON layers. Currently only one can be used at a time. Maybe implement a toggle feature.
  layersConfig.forEach((layer) => {
    if (layer.active) {
      console.log("LAYER: ", layer);
      loadGeoJsonLayer(layer);
    }
  });
}

/**
 * Helper function to extract the zone ID from a GeoJSON feature.
 * @param {Object} feature - The GeoJSON feature
 * @returns {string} - The zone ID
 * to be used with geojson object
 */
function getZoneId(feature) {
  return (
    feature.getProperty("boro_cd") ||
    feature.getProperty("boro_code") ||
    feature.getProperty("cong_dist") ||
    feature.getProperty("elect_dist") ||
    feature.getProperty("precinct") ||
    feature.getProperty("school_dist")
  );
}

//to be used with json
function getZoneFromFeature(feature) {
  return (
    feature["properties"]["boro_cd"] ||
    feature["properties"]["boro_code"] ||
    feature["properties"]["cong_dist"] ||
    feature["properties"]["elect_dist"] ||
    feature["properties"]["precinct"] ||
    feature["properties"]["school_dist"]
  );
}

/**
 * Function to compute the bounding box for each selected zone
 * NOTE: A bounding box typically consists of two points: Southwest Corner and NorthEast Corner/
 * THIS Constitutes as a boundary box. 
 * 
    -73.85997492285983,
    40.70110059871763,
    -73.83696237811037,
    40.7092234564188
  
 */
function computeBoundingBoxes() {
  Object.entries(selectedZoneCoords).forEach(([zoneId, geometry]) => {
    const bbox = turf.bbox(geometry);
    selectedZoneBBOX[zoneId] = bbox;
  });
}

function calculateCenterRadius(zoneBBOX){
   /**
    * We'll use the turf.centroid(points) method to find the middle of a set of points (the bbox NE and SW corners.)
    */   
   const centerRadiusObj = {}
   const [SWLat, SWLng, NELat, NELng] = zoneBBOX;

   const calculatedCenter = turf.point([(SWLng + NELng) / 2, (SWLat + NELat) / 2]);
   centerRadiusObj['center'] = calculatedCenter

   // Define the SouthWest and NorthEast Corner
   const SWcorner = turf.point([SWLng, SWLat])
   const NEcorner = turf.point([NELng, NELat])
  //  console.log("SWCorner: ", SWcorner, "\n\nNECorner: ", NEcorner)
 
   // Calculate the distance to each corner and find the maximum in meters.
   const radius = Math.max(turf.distance(calculatedCenter, SWcorner, {units: 'meters'}), turf.distance(calculatedCenter,NEcorner, {units: 'meters'}))  
   centerRadiusObj['radius'] = radius
   

  //  console.log("AT THE END CALCULATE BBOX FARTHEST CORNER RADIUS Function. centerRadiusObj= ", centerRadiusObj)
   return centerRadiusObj;
}

async function queryPlacesAPI(searchTerm){

  searchHistory.push(searchTerm)
  /**
   * Objective: For each zone in the selectedZoneBBOX, we're calling the google places api with functions calculateCenterPoint and calculateRadiusFromCenterToBBOXPoint (use the Haversine formula to calculate the distance between two points)
   */

  //reset the placesWithinSelectedZone object for each call
  placesWithinSelectedZone = {}
    
  returnGoogleMapKey()
  .then((data) => {
    
    /**For Every BBOX we have, we'll calculate the center point and radius within the bbox 
     * NOTE: the radius will capture the entire bbox if captured from the bbox point furthest from the middle to account for irregular polygons with extended points.  
     * Now that we know the entire zone will be covered, we ensure all places within the zone will be captured. 
     * 
    */
    Object.keys(selectedZoneBBOX).forEach((zone) =>  {
      // Calculate the center and radius for each BBOX
      const { center, radius } = calculateCenterRadius(selectedZoneBBOX[zone]);
      // console.log("ZONE ID: ", zone, "\nZONE CENTER: ", center, "\nZONE RADIUS: ", radius);
    
      console.log("CENTER: ", center)
      console.log("RADIUS: ", radius)
      

      // Construct the endpoint URL
      const endpoint = `/api/places?center=${turf.getCoord(center['geometry']['coordinates'])}&radius=${radius}&keyword=${searchTerm}&googleMapsApiKey=${data.googleMapsApiKey}`;
    
      // Fetch the places from the API
      fetch(endpoint)
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
          // Check if the 'results' property exists in the response and status is OK
          if (data.results && data.status === 'OK') {
            console.log(`DATA for ${zone}.`, data)
            // Filter the places within the zone polygon
            const placesInZone = filterQueryPlacesAPIResults(data, zone)
            if(placesInZone){placesWithinSelectedZone[zone] = placesInZone}
            // Log the filtered places or render them as needed
            console.log("Places in Zone:", placesWithinSelectedZone);
          } else {
            console.error("No results found in the API response");
          }
        })
        .catch(error => console.error("ERROR WITH THE PLACES API fetch: ", error));
    });
  })
  .catch(err => {console.error("ERROR WITH THE GOOGLE MAP API KEY FETCH FROM SERVER: ", err)})
}

function filterQueryPlacesAPIResults(data, zone){
  const foundInZone = data.results.filter(place => {
    // Convert the place location to a GeoJSON Point
    const point = turf.point([place.geometry.location.lng, place.geometry.location.lat]);
    // Check if the point is within the zone polygon
    return turf.booleanPointInPolygon(point, selectedZoneCoords[zone]);
  });

  return foundInZone
}

// Used to clear markers on the map 
function clearMarkers() {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];  // Reset the array
}

// Assuming 'map' is your Google Map instance
async function addMarkersToMap() {

  clearMarkers()
  const {AdvancedMarkerElement} = await google.maps.importLibrary('marker')

  Object.keys(placesWithinSelectedZone).forEach(zone => {
    const places = placesWithinSelectedZone[zone];

    console.log("ZONE: ", zone, "COORDINATES: ", places)

    places.forEach(place => {
      console.log(place)
      const marker = new AdvancedMarkerElement({
        position: {lat: place.geometry.location.lat, lng: place.geometry.location.lng},
        map: map,
        title: place.name,
        zIndex: 99 //Allows markers to be clicked instead of the map 
      });

      // Create an InfoWindow instance
      let infoWindow = new google.maps.InfoWindow();

      // Sample data for the marker
      let businessDetails = {
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        total_ratings: place.user_ratings_total
      };
      
      // marker.addListener('click', ()=>{
      //   console.log('marker clicked!')
      // })

      // Add click event listener to the marker
      marker.addListener('click', function() {
        // Content for the InfoWindow
        var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h1 id="firstHeading" class="firstHeading">' + businessDetails.name + '</h1>'+
            '<div id="bodyContent">'+
            '<p><b>Address:</b> ' + businessDetails.address + '</p>'+
            '<p><b>Rated:</b> ' + businessDetails.rating + '/5 </p>'+
            '<p><b>Rated by: </b> ' + businessDetails.total_ratings + ' customers!</p>'
            '</div>'+
            '</div>';

        // Set the content and open the InfoWindow
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });

      markersArray.push(marker)
    })
  })
}


/**
 * Loads a GeoJSON layer onto the map and sets up event listeners for interaction.
 * @param {Object} layerConfig - Configuration object for the layer
 *
 * Data Feature in Google Maps API:
 * Within the Google Maps API, a "Data.Feature" refers to a specific class used in the Data layer of the API. The Data layer    provides a container for arbitrary geospatial data (points, line strings, polygons, etc.). A "Data.Feature" is an individual element in this layer that can represent a single point, line, or polygon. It can hold geometry, a set of properties, and an ID.
 * Here's an example of how a Data.Feature might be used in the Google Maps API:
 * javascript
 * Copy code
 * var myFeature = new google.maps.Data.Feature({
 * geometry: new google.maps.Data.Point(new google.maps.LatLng(37.422, -122.084)),
 * id: 'myFeature',
 * properties: {
 *  name: 'Googleplex',
 *   category: 'office'
 * }
 * });
 * In this example, myFeature is a Data.Feature with a point geometry representing a location, an ID, and a set of properties including a name and category.
 */
function loadGeoJsonLayer(layerConfig) {
  fetch(`http://localhost:3000/geojson/${layerConfig.name}.geojson`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Geo JSON Data: ", data);

      // Store the GeoJSON features
      geoJsonFeatures[layerConfig.id] = data.features;

      //Creates a data layer on the maps api. This allows us to visualize and load the data as a set.
      map.data.addGeoJson(data);

      // Style and click event for GeoJSON layer
      map.data.setStyle((feature) => {
        const zoneId = feature.getId();
        const isSelected = selectedZones[zoneId];
        return {
          fillColor: isSelected ? "#00FF00" : "#FF3333",
          strokeColor: isSelected ? "#00FF00" : "#FF5555",
          strokeWeight: 1,
        };
      });

      // Will grab the id of the object passed. Since all geojsons have different ids, this will grab them all.
      map.data.addListener("click", (event) => {
        const zoneId = getZoneId(event.feature);
        console.log("ZONE ID: ", zoneId);

        if (selectedZones[zoneId]) {
          delete selectedZones[zoneId];
          delete selectedZoneBBOX[zoneId];
          delete selectedZoneCoords[zoneId];
          console.log("SELECTED ZONE COORDS: ", selectedZoneCoords);
          console.log("SELECTED ZONE BBOX: ", selectedZoneBBOX);
        } else {
          selectedZones[zoneId] = true;

          console.log(geoJsonFeatures);
          // Retrieve geometry data for the selected zone
          const geometry = geoJsonFeatures[layerConfig.id].find(
            (feature) => getZoneFromFeature(feature) === zoneId
          )?.geometry;
          selectedZoneCoords[zoneId] = geometry;
          computeBoundingBoxes();
          // Use the geometry data as needed
          console.log("Selected Zone Geometry: ", geometry);
          console.log("SELECTED ZONE COORDS: ", selectedZoneCoords);
          console.log("SELECTED ZONE BBOX: ", selectedZoneBBOX);
        }

        console.log("Selected Zones: ", Object.keys(selectedZones));
        map.data.setStyle((feature) => {
          const featureZoneId = getZoneId(feature);
          const isSelected = selectedZones[featureZoneId];

          return {
            fillColor: isSelected ? "#00FF00" : "#FF3333",
            strokeColor: isSelected ? "#00FF00" : "#FF5555",
            strokeWeight: 1,
          };
        });
      });
    })
    .catch((err) => {
      console.error("Error loading GeoJSON data", err);
    });
}

// Load the Google Maps API script with the API key from the express get('/api/google-maps-key') call
// This is using the legacy code which relies on the api call rather than the NPM package: @googlemaps/js-api-loader
async function returnGoogleMapKey(){
  return fetch("http://localhost:3000/api/google-maps-key")
  .then((response) => response.json())
}

// Function to render predictions
function displayPredictions(predictions) {
  const autocompleteResults = document.getElementById('autocomplete-results');
  // Clear any existing predictions
  autocompleteResults.innerHTML = '';

  // Create a list of predictions
  predictions.forEach(prediction => {
    const listItem = document.createElement('div');
    listItem.classList.add('autocomplete-item');
    listItem.textContent = prediction.description;
    listItem.setAttribute('data-place-id', prediction.place_id);

    // Add an event listener to each prediction
    listItem.addEventListener('click', function() {
      const placeId = this.getAttribute('data-place-id');
      // Populate the input field
      document.getElementById('autocomplete-input').value = this.textContent;
      // Optionally trigger a search or place a marker on the map
      // ...
      
      // Clear predictions
      autocompleteResults.innerHTML = '';
    });

    autocompleteResults.appendChild(listItem);
  });
}


function main(){
  returnGoogleMapKey()
  .then((data) => {
    const scriptId = "google-maps-api-script";
    if (!document.getElementById(scriptId)) {
      //for google maps api script
      const script = document.createElement("script");
      script.id = scriptId;
      // Use &libraries=places to include the places api
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.googleMapsApiKey}&libraries=places,geometry&callback=initMap`;
      script.async = true;

      //for turf script
      const turfy = document.createElement("script");
      turfy.id = "turf_import";
      turfy.src = "https://unpkg.com/@turf/turf";
      turfy.async = true;

      document.body.appendChild(script);
      document.body.appendChild(turfy);
    }
  })
  .catch(err => err)
}

//Call main
main()

// At the end of your JavaScript file
document.addEventListener("DOMContentLoaded", (event) => {
  const searchForm = document.getElementById("searchForm");
  const resultsFound = document.getElementById("resultsFound");
  const autocomplete_input = document.getElementById('autocomplete-input')
  const commentForm = document.getElementById('comment-form')

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchFor = event.target.children[0].value
    queryPlacesAPI(searchFor)
    setTimeout(() => {addMarkersToMap()}, 3150)
    setTimeout(() => {resultsFound.innerHTML = `${markersArray.length} Results Found for ${searchHistory[searchHistory.length - 1]}`}, 3150)
    searchForm.reset();
  });

  autocomplete_input.addEventListener('input', async function(e) {
    // const searchFor = autocomplete_input
    console.log("autocomplete event listener triggered. new value: ", autocomplete_input.value)
    const response = await fetch(`/autocomplete?search=${autocomplete_input.value}`);
    const data = await response.json();
    if (data.predictions) {
      displayPredictions(data.predictions);
    }
    console.log("Autocomplete data: ", data)
  });

});
