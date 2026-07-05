const crime_data_list = [
    'data_processing/data_raw/crime/2023-05/2023-05-avon-and-somerset-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-bedfordshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-btp-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-cambridgeshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-cheshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-city-of-london-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-cleveland-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-cumbria-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-derbyshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-devon-and-cornwall-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-dorset-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-durham-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-dyfed-powys-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-essex-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-gloucestershire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-gwent-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-hampshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-hertfordshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-humberside-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-kent-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-lancashire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-leicestershire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-lincolnshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-merseyside-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-metropolitan-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-norfolk-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-north-wales-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-north-yorkshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-northamptonshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-northern-ireland-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-northumbria-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-nottinghamshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-south-wales-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-south-yorkshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-staffordshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-suffolk-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-surrey-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-sussex-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-thames-valley-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-warwickshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-west-mercia-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-west-midlands-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-west-yorkshire-street.csv',
    'data_processing/data_raw/crime/2023-05/2023-05-wiltshire-street.csv'
]

export async function load_data() {
    // import geometry and population
    const geometry_module   = await import('../data/LSOA_2021_geometry_small.json');
    const population_module = await import('../data/LSOA_2021_population.json');

    const geometry_json   = geometry_module.default
    const population_json = population_module.default

    // turn the population data into a dictionary
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

    return geometry_json
}