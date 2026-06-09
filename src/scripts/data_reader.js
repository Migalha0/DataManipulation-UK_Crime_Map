import geometry_json from '../data/LSOA_2021_geometry.json'
import population_json from '../data/LSOA_2021_population.json'

// const lsoa_1 = geometry.features[0].properties.LSOA21CD
// console.log(lsoa_1)

//   {
//     "LAD_2021_Code": "E07000221",
//     "LAD_2021_Name": "Stratford-on-Avon",
//     "LSOA_2021_Code": "E01031187",
//     "LSOA_2021_Name": "Stratford-on-Avon 007A",
//     "Total": 1917
//   }

const polygon = population_json.find(pol => pol.LSOA_2021_Code == 'E01031188')
console.log(polygon.Population)