import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import {load_data, update_lsoa} from './data_reader'

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             MAP SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const tilemap_openstreet = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const tilemap_esri       = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

const map = L.map('map',
    {
        renderer: L.canvas(),
        maxBounds: [
            [56.3, -6.0],
            [49.3, 2.0]
        ],
        maxBoundsViscosity: 0.8,
        minZoom:7,
        maxZoom:12,
    }
).setView([53.5,-2.0],7)

L.tileLayer(tilemap_esri).addTo(map);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             POLYGONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const data = await load_data();

const updated_data = update_lsoa(data.geometry_json,data.population_json);

L.geoJSON(
    updated_data,
    {
        style: {
            color: '#0cd8d8',
            weight: 0.3
        }
    }
).addTo(map)

console.log(updated_data);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             ONCLICK
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function onMapClick(e){
    const marker = L.marker(e.latlng).addTo(map);

    marker
        .bindPopup(`${e.latlng}`)
        .openPopup();

    marker.on('click', () => marker.remove())
}

map.on('click', onMapClick)