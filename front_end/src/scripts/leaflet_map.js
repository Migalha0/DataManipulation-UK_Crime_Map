import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import * as turf from '@turf/turf'
import {load_data} from './data_reader'

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

// normalizing population to better see population distribution over land
const populations = data.features.map(
    feature => feature.properties.population
);

const min_population = Math.min(...populations);
const max_population = Math.max(...populations);

// styling color according to pop count
L.geoJSON(data, {
    style: feature => {

        // get population normalize and color accordingly
        const population = feature.properties.population;

        const population_color_normalized =
            Math.sqrt(
                (population - min_population) /
                (max_population - min_population)
            );

        return {
            
            color: '#000000',
            weight: 0.3,
            fillColor:'#d80c0c',
            fillOpacity: population_color_normalized
        };
    }
}).addTo(map);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             ONCLICK
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function onMapClick(e){
    // get point
    // search polygon which had point inside
    const point = turf.point([e.latlng.lng,e.latlng.lat])    
    let polygon_data = null
    
    for (const feature of data.features){
        if(turf.booleanPointInPolygon(point,feature)){
            polygon_data = feature.properties;
            break;
        }
    }
    
    // print info
    const marker = L.marker(e.latlng).addTo(map);
    marker
        .bindPopup(`${e.latlng} <br> ${polygon_data.district} ${polygon_data.population}`)
        .openPopup();

    marker.on('click', () => marker.remove())
}

map.on('click', onMapClick)