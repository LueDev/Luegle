/*
GOAL: Create a map based application similar to this: https://boundaries.beta.nyc/?map=bid
that can be integrated into other applications. The map has functions that returns values based on the data being looked for. 

For example, If I select certain sections in the map and looking for restaurants, I can interact with the map and an API response 
can be returned where the borough, sub-borough, 

Long Term Goal: Develop a developer friendly mapping engine similar to ArcGIS but that is cheaper or open sourced 

Creating a developer-friendly mapping system that rivals established platforms like ArcGIS is an ambitious endeavor, but it's certainly feasible with the right approach. Here are some suggestions to help you get started:

User-Friendly API:

Design a simple and intuitive RESTful API that allows developers to easily fetch and manipulate geographic data.
Provide comprehensive documentation with examples, tutorials, and interactive API explorers.
Ensure your API supports common data formats like GeoJSON and KML for interoperability.
Modular Design:

Create a modular system where developers can choose which layers (e.g., city council districts, borough boundaries, community districts) they want to include in their applications.
Offer pre-built modules for common tasks, such as geocoding, routing, and spatial analysis, to simplify development.
Scalable Infrastructure:

Utilize cloud services for hosting your platform to ensure scalability and reliability. Consider using serverless architectures to optimize for usage-based scaling.
Implement a content delivery network (CDN) to serve static assets like map tiles quickly and efficiently.
Customization and Extensibility:

Allow developers to style maps according to their brand guidelines and application themes.
Provide a plugin system or support for third-party extensions to enable developers to add custom functionality.
Interactive Map SDK:

Develop a robust front-end SDK that facilitates map interaction, such as zooming, panning, and clicking on layers to display additional information.
Ensure your SDK is cross-platform and supports various frameworks and languages.
Community Engagement:

Foster a developer community by providing forums, chat channels, and regular meetups or webinars.
Encourage contributions through open-source initiatives or developer incentive programs.
Support and SLAs:

Offer responsive support with multiple channels like email, chat, and phone.
Provide Service Level Agreements (SLAs) to guarantee uptime and performance for enterprise users.
Legal and Compliance:

Make sure to have clear terms of service, especially regarding data usage and privacy.
Stay compliant with regulations like GDPR for handling user data.
Examples and Use Cases:

Showcase real-world applications and case studies that demonstrate the capabilities and benefits of your platform.
Provide sample apps and code snippets that developers can use as a starting point.
Feedback Loop:

Implement a system for collecting and acting on user feedback to continuously improve your platform.
Regularly update your roadmap and communicate changes and new features to your user base.
By focusing on simplicity, performance, and a developer-centric approach, you can position your platform as a more accessible alternative to complex systems like ArcGIS. Remember that building a community and a robust ecosystem around your platform can significantly contribute to its success and adoption.

TODO[]: Use the places api to list places on the map with advanced markers (maybe a way to customize marker per filter criteria. Suppose we can filter by more than one thing on a given selected zone (like housing prices and restaurants) to make house hunting much more exciting. 
TODO[]: Calculate the bounds within a selected zone (the answer could be shapefiles but requires further investigation) and return the coordinates usable when calling the google places api
TODO[]: Add a mousehover event listener that will show the zoneID and if the filtered data is hidden on the map, give the choice to show the results on the infoWindow. Can I customize the infowindow to include the data the user selects rather than just the data set by the program? much more interesting. For example, if I'm looking at prices of homes and number of ammenities it has. Can that be the data shown in the infoWindow and anything else we'd like to add? The UI could be tricky for that but think it through.
*/


//TODO[x]: Create an array of objects that contain the information for each of the geojson files.
const layersConfig = [
  {
    id: "boroughBoundaries",
    name: "Borough_Boundaries",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/Borough_Boundaries.geojson",
    active: false,
  },
  {
    id: "cityCouncilDistricts",
    name: "City_Council_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/City_Council_Districts.geojson",
    active: false,
  },
  {
    id: "communityDistricts",
    name: "Community_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/Community_Districts.geojson",
    active: true,
  },
  {
    id: "congressionalDistricts",
    name: "Congressional_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/Congressional Districts.geojson",
    active: false,
  },
  {
    id: "electionDistricts",
    name: "Election_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/Election_Districts.geojson",
    active: false,
  },
  {
    id: "policeDistricts",
    name: "Police_Precincts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/Police_Precincts.geojson",
    active: false,
  },
  {
    id: "schoolDistricts",
    name: "School_Districts",
    filePath:
      "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data/School_Districts.geojson",
    active: false,
  },
];

//This will hold the selectedZones when clicking on individual zones
let selectedZones = {};

//TODO[x]: Initiate the map, center it at Chelsea, NYC.
//Load the GeoJSON layers (these can stack but not visually on the map yet.)
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7465, lng: -74.0014 },
    zoom: 13,
  });

  // Load GeoJSON layers. Currently only one can be used at a time. Maybe implement a toggle feature. 
  layersConfig.forEach((layer) => {
    if (layer.active) {
      console.log(layer);
      loadGeoJsonLayer(layer);
    }
  });
}


//TODO[x]:Load the boundaries of the loaded layer config.
//FIXME: When two layer configs are active, the map doesn't know which I'm interacting with because they're layered on top of one another. I can only use one layer config at a time for now.
function loadGeoJsonLayer(layerConfig) {
  fetch(`http://localhost:3000/geojson/${layerConfig.name}.geojson`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      map.data.addGeoJson(data);

      // Style and click event for GeoJSON layer
      map.data.setStyle((feature) => {
        const zoneId = feature.getId();
        const isSelected = !!selectedZones[zoneId];
        return {
          fillColor: isSelected ? "#00FF00" : "#FF3333",
          strokeColor: isSelected ? "#00FF00" : "#FF5555",
          strokeWeight: 1,
        };
      });

      //Will grab the id of the object passed. Since all geojsons have different ids, this will grab them all.
      map.data.addListener("click", (event) => {
        const zoneId =
          event.feature.getProperty("boro_cd") ||
          event.feature.getProperty("boro_code") ||
          event.feature.getProperty("cong_dist") ||
          event.feature.getProperty("elect_dist") ||
          event.feature.getProperty("precinct") ||
          event.feature.getProperty("school_dist");
        console.log(zoneId);

        if (selectedZones[zoneId]) {
          delete selectedZones[zoneId];
        } else {
          selectedZones[zoneId] = true;
        }

        console.log("Selected Zones: ", Object.keys(selectedZones));
        map.data.revertStyle();
        map.data.setStyle((feature) => {
          const featureZoneId =
            feature.getProperty("boro_cd") ||
            feature.getProperty("boro_code") ||
            feature.getProperty("cong_dist") ||
            feature.getProperty("elect_dist") ||
            feature.getProperty("precinct") ||
            feature.getProperty("school_dist");
          const isSelected = !!selectedZones[featureZoneId];

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

fetch("http://localhost:3000/api/google-maps-key")
  .then((response) => response.json())
  .then((data) => {
    const scriptId = "google-maps-api-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      // Use &libraries=places to include the places api 
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.googleMapsApiKey}&callback=initMap`;
      script.async = true;
      document.body.appendChild(script);
    }
  });

