import './style.css'

// get all forces
// getData('https://data.police.uk/api/forces')

// get info from specific force (search by force ID)
// getData('https://data.police.uk/api/forces/cambridgeshire')

// get info from personnel from specific force (search by force ID) (not all PDs present this)
// getData('https://data.police.uk/api/forces/cambridgeshire/people')

// crime categories
// getData('https://data.police.uk/api/crime-categories?date=2024-01')

// we use the values *10 so we can work with integers, avoiding flaoting point precision
const west_edge  = -60;   // -6.0 * 10
const east_edge  = 20;    //  2.0 * 10
const north_edge = 563;   // 56.3 * 10
const south_edge = 493;   // 49.3 * 10

const step = 2;           // 0.2 * 10

function sleep(ms) {
    return new Promise(resolve => 
        setTimeout(resolve,ms)
    );
}

async function getData(url){

  try {

    const response = await fetch(url);

    if (response.status === 503) {
      return {
        status: 503
      };
    }

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return {
      status: 200,
      data: await response.json()
    };

  } catch (error) {
    
    console.error(error.message);
    return(null);

  }
  
}

function generate_grid(
    north_boundary,
    south_boundary,
    west_boundary,
    east_boundary,
    step
) {
    const grid = [];

    for (
        let north = north_boundary;
        north - step >= south_boundary;
        north -= step
    ) {
        for (
            let west = west_boundary;
            west + step <= east_boundary;
            west += step
        ) {
            grid.push({
                north: north / 10,
                south: (north - step) / 10,
                west: west / 10,
                east: (west + step) / 10,
            });
        }
    }

    return grid;
}

async function scan_grid(grid,step_var,prefix = "") {

    const grid_data = [];

    for (const [index, square] of grid.entries()) {

        const poly = 
        `${square.north},${square.west}:` +
        `${square.north},${square.east}:` +
        `${square.south},${square.west}:` +
        `${square.south},${square.east}`;

        const result = await getData(
            `https://data.police.uk/api/crimes-street/all-crime?date=2023-05&poly=${poly}`
        );
        console.log(result);

        await sleep(80);

        if(result === null){
            continue;
        }

        if(result.status === 429){
            return {
                status: 429
            };
        }

        if(result.status === 503){

            console.log('GENERATING CHILD GRID');

            const sub_grid = generate_grid(
                square.north,
                square.south,
                square.west,
                square.east,
                step_var / 2
            );

            const child_data = await scan_grid(
                    sub_grid,
                    step_var / 2,
                    `${index + 1}`
                );

            console.log('ENDING CHILD GRID');
            grid_data.push(...child_data);

            continue;
        }

        grid_data.push(result.data);

        console.log(`
            ${prefix} ${index+1}/${grid.length} | ${result.data.length} crimes
            `);
    }

    console.log('end')
    return grid_data
}

const grid = generate_grid(
    north_edge,
    south_edge,
    west_edge,
    east_edge,
    step
)

console.log(grid)

const grid_data = await scan_grid(grid,step)
console.log(grid_data)