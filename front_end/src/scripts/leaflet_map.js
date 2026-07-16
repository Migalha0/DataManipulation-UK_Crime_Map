import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import geojson from '../data/geometry.json';

import { get_selected_month } from '../states/month_state';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             MAP SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const tilemap_openstreet = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tilemap_esri       = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

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
).setView([53.5,-2.0],7);

L.tileLayer(tilemap_esri).addTo(map);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    
//             MONTH SELECTION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let current_month = get_selected_month();

async function load_current_month(){

    const response = await fetch(`/data/crime/${current_month}.json`);
    console.log('selected month:', current_month);
    return await response.json();
}

let crime_data = await load_current_month();

document.addEventListener("monthChange", async event =>{

    current_month = get_selected_month();

    crime_data = await load_current_month();

    geojson_layer.setStyle(polygon_style);

});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             POLYGONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// styling color according to pop count

function polygon_style(feature){
        const lsoa = feature.lsoa;

        const crimes = crime_data.lsoa[lsoa] ?? {};

        let total = 0;

        for(const count of Object.values(crimes)){
            total += count;
        }

        return {            
            color: '#000000',
            weight: 0.3,
            fillColor: '#af0c0c',
            fillOpacity: total / 50
        };
}

const geojson_layer = L.geoJSON(geojson, {
    style: polygon_style
}).addTo(map);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             ONCLICK
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function onMapClick(e){
    // get point
    // search polygon which had point inside
    const point = turf.point([e.latlng.lng,e.latlng.lat])
    
    // print info
    const marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup(`eu sou um point :o)`).openPopup();

    marker.on('click', () => marker.remove())
}

map.on('click', onMapClick)