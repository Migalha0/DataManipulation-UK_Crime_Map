import fs from 'node:fs';
import path from 'node:path';
import csv from 'csv-parser';

// creating crime files for each month
const folder_path = '/home/migalha/code/javascript/Data_projects/UKCrimeTracker/data_processing/data_raw/crime';
const folders = fs.readdirSync(folder_path);

const crime_lookup = [];
const crime_type_to_id = {};

for (const folder of folders) {

    const lsoa_crime_dictionary = {};

    const current_path = path.join(folder_path, folder);
    const files = fs.readdirSync(current_path);

    for (const file of files) {

        const file_path = path.join(current_path, file);

        await new Promise((resolve, reject) => {

            fs.createReadStream(file_path)
                .pipe(csv())

                .on('data', row => {

                    const lsoa = row['LSOA code'];
                    const crime_type = row['Crime type'];

                    if (!(crime_type in crime_type_to_id)) {
                        crime_type_to_id[crime_type] = crime_lookup.length;
                        crime_lookup.push(crime_type);
                    }

                    const crime_id = crime_type_to_id[crime_type];

                    if (!lsoa_crime_dictionary[lsoa]) {
                        lsoa_crime_dictionary[lsoa] = {};
                    }

                    if (!lsoa_crime_dictionary[lsoa][crime_id]) {
                        lsoa_crime_dictionary[lsoa][crime_id] = 0;
                    }

                    lsoa_crime_dictionary[lsoa][crime_id]++;
                })

                .on('end', resolve)
                .on('error', reject);

        });
    }

    const month_json = {
        crime_lookup,
        lsoa: lsoa_crime_dictionary
    };

    fs.writeFileSync(
        path.join('../data_processed/crime', `${folder}.json`),
        JSON.stringify(month_json, null, 2),
        'utf-8'
    );

    console.log(`${folder}.json GENERATED`);
}