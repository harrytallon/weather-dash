// ==== CONFIG ====
const WORKER_URL = "https://metoffice-data.harrytallon20.workers.dev/forecast";

const locations = [
  { name: "Halifax", lat: 53.7399634, lon: -1.9570294 },
  { name: "Huddersfield", lat: 53.6521033, lon: -1.8289855 },
  { name: "Leeds", lat: 53.8060755, lon: -1.618304 },
  { name: "Todmorden",  lat: 53.7099469, lon: -2.1427529 },
  { name: "Holmfirth",  lat: 53.5669602, lon: -1.8155426 },
  { name: "Manchester",  lat: 53.4723192, lon: -2.3060345 },
  { name: "Wakefield",  lat: 53.6758229, lon: -1.5515158 },
  { name: "Sheffield",  lat: 53.3958074, lon: -1.6646045 },
  { name: "Keighley",  lat: 53.8641715, lon: -1.9546552 },

];

// ==== FUNCTIONS ====
async function getForecast(lat, lon) {
  const response = await fetch(`${WORKER_URL}?lat=${lat}&lon=${lon}`);
  return response.json();
}

function parseForecast(data) {
  const series = data.features[0].properties.timeSeries;

  // Current conditions
  const now = series[0];
  const current = {
    time: now.time,
    temp: now.screenTemperature,
    rain: now.probOfPrecipitation,
    wind: now.windSpeed10m,
    weather: now.weatherType,            // General weather type
    precip: now.precipitationType || "None" // Precipitation type
  };

  // Next 24 hours, every 4 hours (6 entries)
  const forecast = series
    .filter((_, i) => i % 2 === 0)
    .slice(0, 7)
    .map(f => ({
      time: new Date(f.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      temp: f.screenTemperature,
      rain: f.probOfPrecipitation,
      wind: f.windSpeed10m,
      weather: f.weatherType,
      precip: f.precipitationType || "None"
    }));

    // After parsing your forecast data
document.getElementById("last-updated").textContent = 
    new Date(data.features[0].properties.timeSeries[0].time).toLocaleString();


  return { current, forecast };
}

function renderLocation(name, data) {
  const container = document.createElement("div");
  container.className = "location";

  const forecastItems = data.forecast.map(f => `
    <li>
      ${f.time} — 🌡 ${f.temp}°C | 🌧 ${f.rain}% | 🌬 ${f.wind} m/s | 
      ${f.weather} | Precip: ${f.precip}
    </li>
  `).join("");

  container.innerHTML = `
    <h2>${name}</h2>
    <p>
      <strong>Now:</strong> 🌡 ${data.current.temp}°C | 🌧 ${data.current.rain}% | 
      🌬 ${data.current.wind} m/s | ${data.current.weather} | Precip: ${data.current.precip}
    </p>
    <ul class="forecast-list">${forecastItems}</ul>
  `;

  document.getElementById("weather").appendChild(container);
}

// ==== MAIN ====
async function loadWeather() {
  const weatherContainer = document.getElementById("weather");
  weatherContainer.innerHTML = "<p>Loading weather...</p>";
  
  // Clear container before rendering
  weatherContainer.innerHTML = "";

  for (const loc of locations) {
    try {
      const data = await getForecast(loc.lat, loc.lon);
      const parsed = parseForecast(data);
      renderLocation(loc.name, parsed);
    } catch (err) {
      console.error(err);
      const container = document.createElement("div");
      container.className = "location";
      container.innerHTML = `<h2>${loc.name}</h2><p>Error loading weather</p>`;
      weatherContainer.appendChild(container);
    }
  }
}

// Load on page load
loadWeather();