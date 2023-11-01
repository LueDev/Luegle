# Luegle - An Interactive Geo-Mapping Application

This project is an interactive web-based mapping application that allows users to visualize and interact with various geographic zones such as borough boundaries, city council districts, community districts, and more within New York City. Users can select zones, view details, and integrate with Google Places API to enrich the map with various points of interest.

## Features

- Interactive Map with selectable zones.
- Integration with Google Places API to display points of interest.
- Layer toggling to display different geo-boundaries.
- Responsive design for desktop and mobile devices.
- User account creation for saving preferences and customizations.

## Getting Started

### Prerequisites

Before running this project, you'll need:

- Node.js installed on your system.
- Google Maps API Key with Maps Javascript API and Places API enabled.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LueDev/Luegle.git
   ```

2. Navigate to the project directory: 
```bash
cd Luegle
```

3. Install Dependencies: 
```bash
npm install
```

4. Create a '.env' file in the root directory and add your Google Maps API key.
```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
```

5. Start the development server 
```bash
npm start   
or 
nodemon server.js   (for continuous changes)
```
## Usage

Once the application is running, you can interact with the map by selecting different geographic zones. Points of interest within the selected zone will be displayed on the map, and you can toggle between different layers to visualize various boundaries.

## Contributing
Contributions are welcome! If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

## License
Distributed under the [MIT](https://choosealicense.com/licenses/mit/) License. See LICENSE for more information.

## Contact
Luis - @Papiluee

Project Link: https://github.com/LueDev/Luegle

## Acknowledgments
- Google Maps JavaScript API
- GeoJSON Data Sources
- Flatiron School
- All Contributors
