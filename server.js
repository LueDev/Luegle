const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const app = express();

dotenv.config();

app.get('/', (req, res) => {
    fs.readFile('index.html', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        const renderedHtml = data.replace('YOUR_API_KEY', process.env.GOOGLE_MAPS_API_KEY);
        res.send(renderedHtml);
    });
});

app.get('/api/google-maps-key', (req, res) => {
    res.json({googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// app.get('/geojson/boroughBoundaries', (req, res) => {
//     res.json({AttomApiKey: process.env.ATTOM_API_KEY });
// });

app.use('/app.js', express.static('app.js')); // Serve app.js statically

//importing the geojson data statically for express js to utilize: 
app.use('/geojson', express.static('/Users/luisjorge/code/Flatiron-Phase-1/20-Phase_1_Project/my_Phase_1_Project/NYC_GeoJSON_Data'));

app.listen(3000, () => console.log('Server started on port 3000'));
