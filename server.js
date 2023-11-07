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
    res.send(data);
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

app.get('/autocomplete', async (req, res) => {
    const searchTerm = req.query.search;
    const url = `https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${searchTerm}&location=40.7128,-74.006&radius=200000&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    try {
      const response = fetch(url)
      .then(response => response.json())
      .then(data => res.json(data))
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


// app.use("/scripts", express.static(path.join(__dirname, "public")));
app.use("/app.js", express.static("app.js")); // Serve app.js statically

//importing the geojson data statically for express js to utilize:
app.use("/geojson",
  express.static(
    "/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/Luegle/NYC_GeoJSON_Data"
    || "Luegle/NYC_GeoJSON_Data"
  )
);

app.listen(3000, () => console.log("Server started on port 3000"));
