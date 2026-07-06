import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
import * as turf from '@turf/turf'
import geojson_data from '../data/LSOA_2021_processed.json'

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


// normalizing population to better see population distribution over land
// const populations = geojson_data.features.map(
//     feature => feature.properties.Population
// );
const crimes = geojson_data.features.map(
    feature => feature.properties.Crime_count ?? 0
);

// const min_population = Math.min(...populations);
// const max_population = Math.max(...populations);
const max_crime = Math.max(...crimes);

// styling color according to pop count
L.geoJSON(geojson_data, {
    style: feature => {

        // get population normalize and color accordingly
        // const population = feature.properties.Population;

        // const population_color_normalized =
        //     Math.sqrt(
        //         (population - min_population) /
        //         (max_population - min_population)
        //     );

        const crime = feature.properties.Crime_count ?? 0;

        const crime_color_normalized = Math.sqrt(
            (crime)/(max_crime)
        );

        return {
            
            color: '#000000',
            weight: 0.3,
            fillColor:'#d80c0c',
            fillOpacity: crime_color_normalized
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
    
    for (const feature of geojson_data.features){
        if(turf.booleanPointInPolygon(point,feature)){
            polygon_data = feature.properties;
            break;
        }
    }
    if(!polygon_data){
        return
    }
    
    // print info
    const marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup(`${e.latlng} <br> ${polygon_data.LSOA21NM} <br> population: ${polygon_data.Population}<br>crime: ${polygon_data.Crime_count}`).openPopup();

    marker.on('click', () => marker.remove())
}

map.on('click', onMapClick)