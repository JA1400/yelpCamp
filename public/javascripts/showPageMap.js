
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

//add a marker to the map
const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    //adds marker popup when we click the marker
    .setPopup(
        new mapboxgl.Popup( {offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3>`
        )
    )
    .addTo(map);