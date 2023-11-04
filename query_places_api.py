# query_places_api.py

import sys
import requests

def query_places_api(southwest_lat, southwest_lng, northeast_lat, northeast_lng, api_key):
    # Construct the URL for the Places API
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={southwest_lat},{southwest_lng}&radius=50000&key={api_key}"
    
    response = requests.get(url)
    results = response.json().get('results', [])
    
    # Filter out places not within the actual bounds
    filtered_results = [
        place for place in results
        if southwest_lat <= place['geometry']['location']['lat'] <= northeast_lat
        and southwest_lng <= place['geometry']['location']['lng'] <= northeast_lng
    ]
    
    return filtered_results

if __name__ == "__main__":
    southwest_lat = float(sys.argv[1])
    southwest_lng = float(sys.argv[2])
    northeast_lat = float(sys.argv[3])
    northeast_lng = float(sys.argv[4])
    api_key = sys.argv[5]
    
    places = query_places_api(southwest_lat, southwest_lng, northeast_lat, northeast_lng, api_key)
    print(places)
