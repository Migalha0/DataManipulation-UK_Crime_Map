import fs from 'node:fs';
import path from 'node:path';
import csv from 'csv-parser';

import geometry   from '../data_raw/LSOA_2021_geometry.json'   with {type: 'json'};

// create the just the geometry and lsoa code JSON

for(const feature of geometry.features){

    feature.lsoa = feature.properties.LSOA21CD

    delete feature.properties
}

fs.writeFileSync(
    path.join('../data_processed', 'geometry.json'),
    JSON.stringify(geometry, null, 2),
    'utf-8'
)

console.log('GEOJSON FILE CREATED')