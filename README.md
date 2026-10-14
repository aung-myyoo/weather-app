# Weather App

A simple weather lookup app built with vanilla HTML, CSS and JavaScript. Search any city to see current conditions and a 4-day forecast, powered by the free [Open-Meteo](https://open-meteo.com/) API (no API key required).

## Features

- City search with geocoding (handles ambiguous city names by region/country)
- Current temperature, "feels like", humidity and wind speed
- Weather icon and description based on WMO weather codes
- 4-day forecast with daily highs/lows

## Running locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (`fetch` API)
- [Open-Meteo](https://open-meteo.com/) geocoding and forecast APIs
