// ==== CONFIG ====
const WORKER_URL = "https://metoffice-data.harrytallon20.workers.dev/forecast";

const locations = [
  { name: "Town Centre", lat: 51.500, lon: -0.120 },
  { name: "North Route", lat: 51.540, lon: -0.100 },
  { name: "South Route", lat: 51.460, lon: -0.110 },
  { name: "East Route",  lat: 51.500, lon: -0.060 },
  { name: "West Route",  lat: 51.500, lon: -0.180 },
  { name: "Outskirts",  lat: 51.580, lon: -0.150 }
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
    weather: now.weatherType
  };

  // Next 24 hours, every 4 hours
  const forecast = series
    .filter((_, i) => i % 4 === 0)
    .slice(0, 6)
    .map(f => ({
      time: new Date(f.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      temp: f.screenTemperature,
      rain: f.probOfPrecipitation,
      wind: f.windSpeed10m,
      weather: f.weatherType
    }));

  return { current, forecast };
}

function renderLocation(name, data) {
  const container = document.createElement("div");
  container.className = "location";

  const forecastItems = data.forecast.map(f => `
    <li>${f.time} — 🌡 ${f.temp}°C | 🌧 ${f.rain}% | 🌬 ${f.wind} m/s | ${f.weather}</li>
  `).join("");

  container.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Now:</strong> 🌡 ${data.current.temp}°C | 🌧 ${data.current.rain}% | 🌬 ${data.current.wind} m/s | ${data.current.weather}</p>
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
