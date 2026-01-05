const API_KEY = "96e0eeaf-3b3f-47ee-918b-f0e1c39f7800";

const locations = [
  { name: "Town Centre", lat: 51.500, lon: -0.120 },
  { name: "North Route", lat: 51.540, lon: -0.100 },
  { name: "South Route", lat: 51.460, lon: -0.110 },
  { name: "East Route",  lat: 51.500, lon: -0.060 },
  { name: "West Route",  lat: 51.500, lon: -0.180 },
  { name: "Outskirts",  lat: 51.580, lon: -0.150 }
];

async function getForecast(lat, lon) {
  const url = `https://data.hub.api.metoffice.gov.uk/weather/forecast/hourly?latitude=${lat}&longitude=${lon}`;

  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "apikey": API_KEY
    }
  });

  return response.json();
}

function renderLocation(name, current, forecast) {
  const container = document.createElement("div");
  container.className = "location";

  container.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Now:</strong> ${current.temp}°C, ${current.desc}</p>
    <ul>
      ${forecast.map(f =>
        `<li>${f.time} — ${f.temp}°C</li>`
      ).join("")}
    </ul>
  `;

  document.getElementById("weather").appendChild(container);
}

async function loadWeather() {
  for (const loc of locations) {
    const data = await getForecast(loc.lat, loc.lon);

    const series = data.features[0].properties.timeSeries;

    // Current (first entry)
    const now = series[0];
    const current = {
      temp: now.screenTemperature,
      desc: now.weatherTypeText
    };

    // Every 4 hours (next 24 hours)
    const forecast = series
      .filter((_, i) => i % 4 === 0)
      .slice(0, 6)
      .map(f => ({
        time: new Date(f.time).toLocaleTimeString([], {hour: '2-digit'}),
        temp: f.screenTemperature
      }));

    renderLocation(loc.name, current, forecast);
  }
}

loadWeather();
