import fs from 'node:fs';
import path from 'node:path';

import geometry   from '../data_raw/LSOA_2021_geometry.json'   with {type: 'json'};
import population from '../data_raw/LSOA_2021_population.json' with {type: 'json'};

// #######################
// #   population data   #
// #######################
//#region 

// create dictionary for fast look up
const lsoa_population_dictionary = {};

for(const entry of population){
    lsoa_population_dictionary[entry.LSOA_2021_Code] = entry.Population
}

//#endregion

// ##################
// #   crime data   #
// ##################
//#region

// create dictionary for fast look up
const lsoa_crime_dictionary = {};

const crime_folder = '../data_raw/crime/2023-05';
const files = fs.readdirSync(crime_folder);

for(const file of files){
    // read file data
    const file_path = path.join(crime_folder, file);
    const text = fs.readFileSync(file_path, 'utf-8');

    // break data into lines and get rid of header
    const lines = text.split('\n');
    const rows = lines.slice(1);

    for(const row of rows){

        const columns = row.split(',');

        // TODO: turn this into an object containing crime_type, timestamp, maybe exact location
        if(lsoa_crime_dictionary[columns[7]] == undefined){
            lsoa_crime_dictionary[columns[7]] = 1;
        } else {
            lsoa_crime_dictionary[columns[7]]++;
        }
    }
}

// console.log(lsoa_crime_dictionary);


//#endregion

// ####################
// #   geojson data   #
// ####################
//#region 

for(const feature of geometry.features){
    const lsoa_code = feature.properties.LSOA21CD;
    feature.properties.p = lsoa_population_dictionary[lsoa_code];

    // TODO: turn crime count per time basis
    feature.properties.c = lsoa_crime_dictionary[lsoa_code];
    // console.log(feature.properties)

    delete feature.properties.LSOA21NMW
    delete feature.properties.BNG_E
    delete feature.properties.BNG_N
    delete feature.properties.LAT
    delete feature.properties.LONG
    delete feature.properties.GlobalID
}

//#endregion

// generate new file
const json = JSON.stringify(geometry, null, 2);
const output_file = path.join('../data_processed','LSOA_2021_processed.json');

fs.writeFileSync(output_file, json, 'utf-8');

console.log(`${output_file} - GENERATED`);