# England crime map

This tool allows for the visualisation of crime data provided by the UK Police overlayed on top of a map of England and  Wales.

## Features

-

## Tools used

- Vite
- JavaScript
- HTML / CSS
- Leaflet
- UK Police API

## Data used

- UK Police data
- ONS census data

---

## To get it working

### DATA

1. Download data

From the UK Police: https://data.police.uk/data/

- select all forces
- include crime data
- do not include outcomes data
- do not inclue stop and search data

If it ever goes out of service: mysourceplaceholder

2. Extract the folder and put the individual months in: /data_processing/data_raw/crime/

3. Run script to generate our final data file

### FRONTEND

1. Install dependencies:

```bash
npm i
```

2. Start the development server:

```bash
npm run dev
```

---

## Future ideas

- offer map of demographic data
- offer map of transportation data

## To fix

-

## License

MIT