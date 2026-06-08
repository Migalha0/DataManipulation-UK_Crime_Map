import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

const tilemap_openstreet = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const tilemap_esri       = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

const map = L.map('map',
    {
        maxBounds: [
            [56.3, -6.0],
            [49.3, 2.0]
        ],
        maxBoundsViscosity: 0.8,
        minZoom:6,
        maxZoom:12,
    }
).setView([53.5,-2.0],7)

L.tileLayer(tilemap_esri).addTo(map);

// POLYGONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var circle = L.circle(
    [53.5,-2.0],
    {
        color: 'rgb(7, 20, 78)',
        opacity:0.4,
        fillColor: 'rgb(35, 56, 148)',
        fillOpacity: 0.4,
        radius:40000
    }
).addTo(map)

var poly_1 = L.polygon(
    [
        [50.5,-4.0],
        [55.5,-4.0],
        [55.5,-2.0],
        [50.5,-2.0],
    ],
    {
        color: 'rgb(7, 20, 78)',
        opacity:0.4,
        fillColor: 'rgb(35, 56, 148)',
        fillOpacity: 0.4,
    }
).addTo(map)

var poly_2 = L.polygon(
    [
        [50.5,-2.0],
        [55.5,-2.0],
        [55.5,-0.0],
        [50.5,-0.0],
    ],
    {
        color: 'rgb(67, 78, 7)',
        opacity:0.4,
        fillColor: 'rgb(193, 206, 21)',
        fillOpacity: 0.4,
    }
).addTo(map)

function onMapClick(e){
    alert('you clicked the map at' + e.latlng)
}
map.on('click',onMapClick)