import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import geojson from '../../public/data/geometry.json';

import { get_selected_month } from '../states/month_state';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//             MAP SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// setting map area
const tilemap_openstreet = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tilemap_esri       = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// creating leaflet map
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
// selecting crime data (per month)
let current_month = get_selected_month();
async function load_current_month(){
    
    const response = await fetch(`/data/crime/${current_month}.json`);

    return await response.json();
}
function get_country_total_crime(){

    country_total_crime = 0;
    for(const lsoa_crimes of Object.values(crime_data.lsoa)){
        for(const [crime_id, count] of Object.entries(lsoa_crimes)){
            country_total_crime+=count;
        }
    }
}

let country_total_crime = 0;
let crime_data = await load_current_month();
get_country_total_crime();

document.addEventListener("monthChange", async event =>{

    current_month = get_selected_month();

    crime_data = await load_current_month();
    get_country_total_crime();

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
    let selected_polygon = undefined
    let polygon_population = undefined

    for(const polygon of geojson.features){
        if(turf.booleanPointInPolygon(point,polygon)){
            selected_polygon = polygon.lsoa
            polygon_population = polygon.population
        }
    }

    // get crime data
    let local_total_crime = 0;
    let local_crime_text = "";
    const crimes = crime_data.lsoa[selected_polygon] ?? {};

    for(const [crime_id, count] of Object.entries(crimes)){

        const crime_name = crime_data.crime_lookup[crime_id]
        local_crime_text += `<tr><th>${crime_name}</th> <td>${count}</td></tr>`
        local_total_crime += count

    }

    // print info
    const marker = L.marker(e.latlng).addTo(map);

    marker.bindPopup(`
        <strong>LSOA:</strong> ${selected_polygon} <br>
        <strong>Population:</strong> ${polygon_population}

        <hr>
        
        <table class='crime-table'>
        ${local_crime_text}
        </table>
        
        <hr>

        <strong>Local total:</strong> ${local_total_crime}<br>
        <strong>Country total:</strong> ${local_total_crime}/${country_total_crime}
        `).openPopup();

    marker.on('click', () => marker.remove())
}

map.on('click', onMapClick)