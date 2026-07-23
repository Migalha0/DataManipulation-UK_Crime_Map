import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';

import { get_selected_month } from '../states/month_state';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 🟢 MAP INITIALIZATION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Base map tile providers
const tilemap_openstreet = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tilemap_esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Load the static geometry dataset once
const geo_response = await fetch('/data/geometry.json');
const geojson = await geo_response.json();

// Create the Leaflet map and constrain the view to the UK
const map = L.map('map', {
    renderer: L.canvas(),
    maxBounds: [
        [56.3, -6.0],
        [49.3, 2.0]
    ],
    maxBoundsViscosity: 0.8,
    minZoom: 7,
    maxZoom: 12,
}).setView([53.5, -2.0], 7);

// Fix Leaflet default marker paths for Vite/Vercel deployment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
});

// Add the selected base tile layer
L.tileLayer(tilemap_esri).addTo(map);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 🟢 MONTHLY CRIME DATA STATE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Currently selected month from the shared state
let month = get_selected_month();

// Cache for the currently loaded month crime dataset
let crime_data = await load_month();

// Total crimes in the currently selected month
let countryCrime = 0;

// Highest crime value encountered while styling polygons
let maxCrime = 0;

/**
 * Load the crime dataset for the currently selected month.
 */
async function load_month() {
    const crime_response = await fetch(`/data/crime/${month}.json`);
    return await crime_response.json();
}

/**
 * Calculate the total number of crimes in the currently loaded month.
 */
function get_countryCrime() {
    countryCrime = 0;

    for (const lsoa_crimes of Object.values(crime_data.lsoa)) {
        for (const count of Object.values(lsoa_crimes)) {
            countryCrime += count;
        }
    }
}

// Initialize the country total for the first loaded month
get_countryCrime();

// React to month changes triggered by the month selector
document.addEventListener('monthChange', async () => {

    month = get_selected_month();

    crime_data = await load_month();
    get_countryCrime();

    // Repaint the polygons using the newly loaded crime data
    geojson_layer.setStyle(polygon_style);

});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 🟢 POLYGON STYLING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const no_data_lsoaNM = [
    // manchester
    'Oldham',
    'Rochdale',
    'Bury',
    'Bolton',
    'Salford',
    'Wigan',
    'Trafford',
    'Tameside',
    'Stockport',
    'Manchester',

    // southwest
    'Caerphilly',
    'Forest of Dean',
    'Cotswold',
    'Tewkesbury',
    'Monmouthshire',
    'Cheltenham',
    'Newport',
    'Stroud',
    'Torfaen',
    'Blaenau Gwent',
    'Gloucester'
]

/**
 * Style each LSOA polygon based on the current month's crime data.
 */
function polygon_style(feature) {

    const lsoa = feature.lsoa;
    const lsoaNM = feature.lsoaNM
    const crimes = crime_data.lsoa[lsoa] ?? {};

    let total = 0;

    for (const count of Object.values(crimes)) {

        total += count;

        if (count > maxCrime) {
            maxCrime = count;
        }

    }

    return {
        color: '#000000',
        weight: 0.3,
        fillColor: no_data_lsoaNM.some(name => lsoaNM.includes(name))
        ? '#b4b4b4'
        : (total === 0 ? '#1ce40a' : '#e40a0a'),
        fillOpacity: no_data_lsoaNM.some(name => lsoaNM.includes(name))
        ? 0.7 
        : (total === 0 ? 1.0 : (total ** 1.5) / maxCrime)
    };
}

// Create the GeoJSON layer once and keep a reference for restyling
const geojson_layer = L.geoJSON(geojson, {
    style: polygon_style
}).addTo(map);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 🟢 DEMOGRAPHIC DATA
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Load the processed demographic dataset used in the popup
const demography_response = await fetch('/data/LSOA_2021_demography.json');
const demography = await demography_response.json();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 🟢 MAP CLICK HANDLER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Display demographic and crime information for the clicked LSOA.
 */
function onMapClick(e) {

    // Create a Turf point from the clicked map coordinates
    const point = turf.point([e.latlng.lng, e.latlng.lat]);

    let lsoa = undefined;
    let lsoaNM = undefined;

    let popTable = '';
    let population = undefined;

    // Find which polygon contains the clicked point
    for (const polygon of geojson.features) {

        if (turf.booleanPointInPolygon(point, polygon)) {

            lsoa = polygon.lsoa;
            lsoaNM = polygon.lsoaNM;
            population = demography[polygon.lsoa].total_population;

            // Build the demographic table for the selected LSOA
            for (const [race, count] of Object.entries(demography[polygon.lsoa])) {

                if (race === 'total_population') {
                    continue;
                }

                popTable += `
                    <tr>
                        <th>${race}</th>
                        <td>${count === 0 ? '-' : count}</td>
                        <td>${count === 0 ? '-' : ((count / population)*100).toFixed(2) + '%'}</td>
                        <td>test</td>
                    </tr>
                `;
            }
        }
    }

    // Gather crime data for the selected LSOA
    let localCrime = 0;
    let crimeTable = '';
    let polygon_crime = undefined;

    const crimes = crime_data.lsoa[lsoa] ?? {};
    let topCrime = {
        'name': '',
        'count': 0
    }
    for (const [crime_id, count] of Object.entries(crimes)) {
        
        const name = crime_data.crime_lookup[crime_id];

        if(count > topCrime.count){
            topCrime.name = name;
            topCrime.count = count;
        }

        crimeTable += `
            <tr>
                <th>${name}</th>
                <td>${count}</td>
            </tr>
        `;

        localCrime += count;
    }

    // Create a temporary marker at the clicked location
    const marker = L.marker(e.latlng).addTo(map);

    // Populate the marker popup with demographic and crime information
    marker.bindPopup(`
        <strong>LSOA:</strong> ${lsoa} ${lsoaNM}<br>

        <strong>Local population:</strong> ${population}<br>
        <table class="table">
            <thead>
                <tr>
                    <th>RACE</th>
                    <th>COUNT</th>
                    <th>PERCENT</th>
                    <th>CRIME CORRELATION</th>
                </tr>
            </thead>
            <tbody>
                ${popTable}
            </tbody>
        </table>

        <hr>

        <strong>Local crime:</strong> ${localCrime == 0? 'NO CRIME' : localCrime} <br>
        <table class="table">
            ${crimeTable}
        </table>

        <hr>

        <strong>This month</strong><br>
        <strong>crime per 1000 people:</strong> ${((localCrime/population)*1000).toFixed(3)} <br>
        <strong>Most prevalent crime</strong><div class="border-highlight">${topCrime.count==0?'NO CRIME' : topCrime.name}</div><br>
        <strong>Country total:</strong> ${localCrime}/${countryCrime}
    `).openPopup();

    // Remove the marker when it is clicked again
    marker.on('click', () => marker.remove());

}

// Attach the click handler to the map
map.on('click', onMapClick);