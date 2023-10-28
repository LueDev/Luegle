fetch('http://localhost:3000/api/google-maps-key')
    .then(response => response.json())
    .then(data => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.googleMapsApiKey}&callback=initMap`;
        script.async = true;
        document.body.appendChild(script);
    });

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -30, lng: 150},
        zoom: 8
    });
}

//
