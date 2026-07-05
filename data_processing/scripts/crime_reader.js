import fs from 'node:fs';
import path from 'node:path';

const test_folder = '../data_raw/crime/2023-05';
const contents = fs.readdirSync(test_folder);

console.log(contents);