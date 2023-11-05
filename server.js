const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const app = express();
const path = require("path");

dotenv.config();

app.get("/", (req, res) => {
  fs.readFile("index.html", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const renderedHtml = data.replace(
      "YOUR_API_KEY",
      process.env.GOOGLE_MAPS_API_KEY
    );
    res.send(renderedHtml);
  });
});

app.get("/api/google-maps-key", (req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
});

app.get("/api/places", async (req, res) => {
  const { center, radius, keyword } = req.query;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center}&radius=${radius}&keyword=${keyword}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("ERROR WITH THE PLACES API fetch: ", error);
    res
      .status(500)
      .json({ error: "Error fetching data from Google Places API" });
  }
});

app.get('/api/autocomplete', async (req, res) => {
    const input = req.query.input; // This is the text input from the user for autocomplete
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY; // Assuming you have your API key in an environment variable for security

    // Construct the Google Places Autocomplete API endpoint
    const autocompleteEndpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${googleMapsApiKey}`;

    try {
        const response = await fetch(autocompleteEndpoint);
        const data = await response.json();
        res.json(data); // Send the autocomplete suggestions back to the client
    } catch (error) {
        console.error("Error with Google Places Autocomplete API: ", error);
        res.status(500).send("Internal Server Error");
    }
});


app.use("/scripts", express.static(path.join(__dirname, "public")));
app.use("/app.js", express.static("app.js")); // Serve app.js statically

//importing the geojson data statically for express js to utilize:
app.use(
  "/geojson",
  express.static(
    "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data"
  )
);

app.listen(3000, () => console.log("Server started on port 3000"));
