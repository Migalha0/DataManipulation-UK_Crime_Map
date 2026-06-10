import geometry_json from '../data/LSOA_2021_geometry.json'
import population_json from '../data/LSOA_2021_population.json'


// JSON OBJECT STRUCTURES

// LSOA delimitation
// {
//     "type":"Feature",
//     "geometry":{
//         "type":"Polygon",
//         "coordinates":[[[-0.09477056340924986,51.52059434721966],[-0.09666078078936619,51.520247384361795],[-0.09729163775202143,51.52158300412512],[-0.09852434982900383,51.5205381151729],[-0.09786630434704072,51.51991988213961],[-0.09746888424515208,51.51786932227693],[-0.09966910000614353,51.51745002161158],[-0.09974884396253891,51.516767601139094],[-0.09785418745809259,51.51660003218221],[-0.09798315236947899,51.515536928847496],[-0.09579724114329558,51.51496710479928],[-0.09548117609104713,51.51544002623229],[-0.0949432898324244,51.51658651049313],[-0.09593354510682896,51.516752793036865],[-0.09438939878217611,51.52066280237556],[-0.09477056340924986,51.52059434721966]]]
//     },
//     "properties":{
//         "LSOA21CD":"E01000001",
//         "LSOA21NM":"City of London 001A",
//         "LSOA21NMW":"",
//         "BNG_E":532123,
//         "BNG_N":181632,
//         "LAT":51.5182,
//         "LONG":-0.09715,
//         "GlobalID":"c625aea8-6d73-4b2a-be76-4d5c44cad9f8"
//     }
// }

// population census
// {
// "LAD_2021_Code": "E07000221",
// "LAD_2021_Name": "Stratford-on-Avon",
// "LSOA_2021_Code": "E01031187",
// "LSOA_2021_Name": "Stratford-on-Avon 007A",
// "Population": 1917
// }

console.time("loop-timer")

const area_lookup = {};
for (const area of population_json) {
    area_lookup[area.LSOA_2021_Code] = area;
}

for (const polygon of geometry_json.features) {
    // run through the polygons and get their codes
    const area_code = polygon.properties.LSOA21CD

    const area = area_lookup[area_code]
    const area_population = area.Population
    const area_district   = area.LAD_2021_Name
    
    console.log(`${area_district}, ${area_code}: ${area_population}`)
}

console.timeEnd("loop-timer")

    // polygon_code = polygon.properties.LSOA21CD

    // const area = population_json.find(a => a.LSOA_2021_Code == polygon_code)
    // console.log(area.Population)