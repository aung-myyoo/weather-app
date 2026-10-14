const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const statusEl = document.getElementById("status");
const weatherEl = document.getElementById("weather");

const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Moderate showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm w/ hail", "⛈️"],
  99: ["Thunderstorm w/ heavy hail", "⛈️"],
};

function describeWeatherCode(code) {
  return WEATHER_CODES[code] || ["Unknown", "🌡️"];
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not reach the geocoding service.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${city}".`);
  }
  const { latitude, longitude, name, admin1, country } = data.results[0];
  const label = [name, admin1, country].filter(Boolean).join(", ");
  return { latitude, longitude, label };
}

async function fetchWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not reach the weather service.");
  return response.json();
}

function renderWeather(label, data) {
  const current = data.current;
  const [description, icon] = describeWeatherCode(current.weather_code);

  document.getElementById("location").textContent = label;
  document.getElementById("updated").textContent = `Updated ${new Date(
    current.time
  ).toLocaleString()}`;
  document.getElementById("icon").textContent = icon;
  document.getElementById(
    "temperature"
  ).textContent = `${Math.round(current.temperature_2m)}°C`;
  document.getElementById("description").textContent = description;
  document.getElementById(
    "feels-like"
  ).textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.getElementById(
    "humidity"
  ).textContent = `${current.relative_humidity_2m}%`;
  document.getElementById(
    "wind"
  ).textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";
  const days = data.daily.time.slice(0, 4);
  days.forEach((date, i) => {
    const dayName = new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
    });
    const max = Math.round(data.daily.temperature_2m_max[i]);
    const min = Math.round(data.daily.temperature_2m_min[i]);
    const [, dayIcon] = describeWeatherCode(data.daily.weather_code[i]);

    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.innerHTML = `
      <span class="name">${dayName}</span>
      <span>${dayIcon}</span>
      <span class="temps">${max}° / ${min}°</span>
    `;
    forecastEl.appendChild(dayEl);
  });

  weatherEl.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  setStatus("Loading...");
  weatherEl.classList.add("hidden");

  try {
    const { latitude, longitude, label } = await geocodeCity(city);
    const data = await fetchWeather(latitude, longitude);
    renderWeather(label, data);
    setStatus("");
  } catch (error) {
    setStatus(error.message || "Something went wrong.", true);
  }
});
