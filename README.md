![Luegle Cover](https://github.com/LueDev/Luegle/blob/main/public/Luegle_Cover.png)

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

Once the application is running, you can interact with the map by selecting different geographic zones which will be highlighted as green once selected. Then use the smart search and autocomplete feature to your liking to search for places WITHIN the selected zones. Without selection, addresses and keywords, autocompleted or not, will not be able to be searched for. 

Blog: https://dev.to/luedev/creating-luegle-a-google-maps-clone-4c3p, 
Video: https://www.loom.com/share/178e15c4ea5f435984a40c93ea01105a?sid=bcb70d83-f152-4cb9-92eb-dfa0c85b1087

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
  - NYC Open Data Boundaries Map
- Flatiron School
- All Contributors
