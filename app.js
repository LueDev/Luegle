/**
 * This script handles the initialization and interaction with a Google Map instance.
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
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Borough_Boundaries.geojson",
    active: false,
  },
  {
    id: "cityCouncilDistricts",
    name: "City_Council_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/City_Council_Districts.geojson",
    active: false,
  },
  {
    id: "communityDistricts",
    name: "Community_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Community_Districts.geojson",
    active: false,
  },
  {
    id: "congressionalDistricts",
    name: "Congressional_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Congressional_Districts.geojson",
    active: false,
  },
  {
    id: "electionDistricts",
    name: "Election_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Election_Districts.geojson",
    active: true,
  },
  {
    id: "policeDistricts",
    name: "Police_Precincts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/Police_Precincts.geojson",
    active: false,
  },
  {
    id: "schoolDistricts",
    name: "School_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data/School_Districts.geojson",
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

/**
 * Initializes the Google Map instance, centers it at the specified coordinates,
 * and loads the active GeoJSON layers.
 * Default map location is Chelsea, NYC.
 * For Guidance: //https://developers.google.com/maps/documentation/javascript/controls
 */
async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
    // disableDefaultUI: true,
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

// Function to compute the bounding box for each selected zone
/**
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
   

   console.log("AT THE END CALCULATE BBOX FARTHEST CORNER RADIUS Function. centerRadiusObj= ", centerRadiusObj)
   return centerRadiusObj;
}


function queryPlacesAPI(searchTerm){

  /**
   * Objective: For each zone in the selectedZoneBBOX, we're calling the google places api with functions calculateCenterPoint and calculateRadiusFromCenterToBBOXPoint (use the Haversine formula to calculate the distance between two points)
   * Step 1: Call the returnGoogleMapKey() promise fetching the key from the endpoint on server.js
   * Step 2: If successful, call calculateCenterPoint and calculateRadiusFromCenter and pass these values into the URL
   */
    
  returnGoogleMapKey()
  .then((data) => {
    
    /**For Every BBOX we have, we'll calculate the center point and radius within the bbox 
     * NOTE: the radius will capture the entire bbox if captured from the bbox point furthest from the middle to account for irregular polygons with extended points.  
     * Now that we know the entire zone will be covered, we ensure all places within the zone will be captured. 
     * 
    */
    Object.keys(selectedZoneBBOX).forEach((zone) => {
      // Calculate the center and radius for each BBOX
      const { center, radius } = calculateCenterRadius(selectedZoneBBOX[zone]);
      console.log("ZONE ID: ", zone, "\nZONE CENTER: ", center, "\nZONE RADIUS: ", radius);
    
      // Construct the endpoint URL
      const endpoint = `/api/places?center=${turf.getCoord(center['geometry']['coordinates'])}&radius=${radius}&keyword=${searchTerm}&googleMapsApiKey=${data.googleMapsApiKey}`;
    
      // Fetch the places from the API
      fetch(endpoint)
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
          // Check if the 'results' property exists in the response
          if (data && data.results) {

            console.log("DATA: ", data)
            // Filter the places within the zone polygon
            const placesInZone = filterQueryPlacesAPIResults(data, zone)
            if(placesInZone !== undefined){placesWithinSelectedZone[zone] = placesInZone}
            // Log the filtered places or render them as needed
            // console.log("Places in Zone:", placesInZone);
          } else {
            console.error("No results found in the API response");
          }
        })
        .catch(error => console.error("ERROR WITH THE PLACES API fetch: ", error));
    });

    console.log("PLACES WITHIN SELECTED ZONE: ", placesWithinSelectedZone)
    

    // return fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=midpoint_latitude,midpoint_longitude&radius=search_radius&type=place_type&keyword=search_keyword&key=${data.googleMapsApiKey}
    // `)
  })
  .catch(err => {console.error("ERROR WITH THE GOOGLE MAP API KEY FETCH FROM SERVER: ", err)})
}

function filterQueryPlacesAPIResults(data, zone){
  const placesInZone = data.results.filter(place => {
    // Convert the place location to a GeoJSON Point
    const point = turf.point([place.geometry.location.lng, place.geometry.location.lat]);
    // Check if the point is within the zone polygon
    return turf.booleanPointInPolygon(point, selectedZoneCoords[zone]);
  });

  return placesInZone
}

function displayFilteredPlacesAPIResults(filteredResults){

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
          delete placesWithinSelectedZone[zoneId]
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
  const applyFiltersButton = document.getElementById("applyFiltersButton");
  const ratingFilterSelect = document.getElementById("ratingFilter");

  const point = turf.point([-74.006, 40.7128]); // New York City
  const buffered = turf.buffer(point, 1, { units: "miles" });
  console.log("Buffered: ", buffered);

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
   
    searchForm.reset();
    // Add logic for what should happen when the form is submitted
  });

  ratingFilterSelect.addEventListener("change", (event) => {
    // You can directly call applyFilters here if that's the intended behavior
    event.preventDefault();
    // applyFilters();
  });

  applyFiltersButton.addEventListener("submit", (event) => {
    event.preventDefault();
    // applyFilters();
  });
});
