export async function load_data() {
    // we need to import assynchronously because these files are huger, otherwise it will hang up the UI rendering
    const geometry_module   = await import('../data/LSOA_2021_geometry_small.json');
    const population_module = await import('../data/LSOA_2021_population.json');

    return {
        geometry_json: geometry_module.default,
        population_json: population_module.default
    }
}

export function update_lsoa(geometry_json, population_json) {
    // turn the population census array into a dictionary
    const area_lookup = {};
    for (const area of population_json) {
        area_lookup[area.LSOA_2021_Code] = area;
    }

    for (const feature of geometry_json.features) {
        // run through each entry in the geoJSON and get their codes
        const area_code = feature.properties.LSOA21CD;

        // quickly lookup area codes in the dictionary
        const area            = area_lookup[area_code];
        const area_population = area.Population;
        const area_district   = area.LAD_2021_Name;
        
        // adding to the geoJSON data from the population census
        feature.properties.population = area_population;
        feature.properties.district   = area_district;
    }

    return geometry_json;
}