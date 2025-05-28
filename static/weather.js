// Weather emoji and description mappings
const weatherCodeToEmoji = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌧️', 55: '🌧️',
  56: '🌧️', 57: '🌧️',
  61: '🌦️', 63: '🌧️', 65: '🌧️',
  66: '🌨️', 67: '🌨️',
  71: '🌨️', 73: '🌨️', 75: '🌨️',
  77: '❄️',
  80: '🌦️', 81: '🌧️', 82: '🌧️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const weatherDescriptions = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Mostly Cloudy',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  56: 'Freezing drizzle (light)', 57: 'Freezing drizzle (dense)',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Heavy freezing rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ slight hail', 99: 'Thunderstorm w/ heavy hail'
};

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  return fetch(url)
    .then(res => res.json())
    .then(data => ({
      temperature: Math.round(data.current_weather.temperature),
      weathercode: data.current_weather.weathercode,
      forecast: data.daily
    }));
}

function updateWeatherDisplay(weather) {
  const weatherIcon = document.getElementById('weather-icon');
  const weatherTemp = document.getElementById('weather-temp');
  const weatherDesc = document.getElementById('weather-desc');
  const forecastEl = document.getElementById('forecast');

  weatherIcon.textContent = weatherCodeToEmoji[weather.weathercode] || '🌈';
  weatherTemp.textContent = `${weather.temperature}°C`;
  weatherDesc.textContent = weatherDescriptions[weather.weathercode] || 'Unknown weather';

  const days = weather.forecast.time;
  const codes = weather.forecast.weathercode;
  const highs = weather.forecast.temperature_2m_max;
  const lows = weather.forecast.temperature_2m_min;

  forecastEl.innerHTML = '';
  for (let i = 0; i < days.length; i++) {
    const icon = weatherCodeToEmoji[codes[i]] || '🌈';
    const fullDate = new Date(days[i]).toLocaleDateString();
    const shortDay = formatDateShort(days[i]);

    const box = document.createElement('div');
    box.style.cssText = `
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 6px;
      position: relative;
      text-align: center;
      user-select: none;
    `;
    box.innerHTML = `
      <div style="position: absolute; top: 4px; left: 6px; font-size: 0.7rem; color: #555; white-space: nowrap;">${fullDate}</div>
      <div style="font-size: 1.4rem; margin-top: 20px;">${icon}</div>
      <div style="font-weight: 500; font-size: 0.9rem;">${shortDay}</div>
      <div style="font-size: 0.8rem;">${lows[i]}° / ${highs[i]}°</div>
    `;
    forecastEl.appendChild(box);
  }
}

function initWeather() {
  const fallback = { lat: 14.83, lon: 120.28 }; // Olongapo fallback
  if (!navigator.geolocation) {
    fetchWeather(fallback.lat, fallback.lon).then(updateWeatherDisplay);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude).then(updateWeatherDisplay),
    () => fetchWeather(fallback.lat, fallback.lon).then(updateWeatherDisplay),
    { timeout: 8000 }
  );
}

window.addEventListener('load', () => {
  initWeather();
});