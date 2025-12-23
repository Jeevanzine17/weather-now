/* ===============================
   GLOBAL STATE
================================ */
let unit = "c";
let currentCoords = null;
let tempChart = null;

const $ = (id) => document.getElementById(id);

/* ===============================
   WEATHER ICON MAPPING
================================ */
function getWeatherIcon(code) {
  if (code === 0) return "icon-sunny.webp";
  if (code <= 2) return "icon-partly-cloudy.webp";
  if (code <= 45) return "icon-overcast.webp";
  if (code <= 48) return "icon-fog.webp";
  if (code <= 55) return "icon-drizzle.webp";
  if (code <= 65) return "icon-rain.webp";
  if (code <= 75) return "icon-snow.webp";
  if (code <= 86) return "icon-snow.webp";
  if (code >= 95) return "icon-storm.webp";
  return "icon-overcast.webp";
}

/* ===============================
   GEOLOCATION ON LOAD
================================ */
window.addEventListener("load", () => {
  if (!navigator.geolocation) {
    $("location").textContent = "Geolocation not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      currentCoords = { latitude, longitude };
      loadWeather(latitude, longitude);
      reverseGeocode(latitude, longitude);
    },
    () => {
      $("location").textContent = "Location permission denied";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

/* ===============================
   REVERSE GEOCODING
================================ */
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "User-Agent": "weather-now-app" } }
    );
    const data = await res.json();

    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.county;

    $("location").textContent = city
      ? `${city}, ${data.address.country}`
      : "Your location";
  } catch {
    $("location").textContent = "Your location";
  }
}

/* ===============================
   WEATHER + AQI FETCH
================================ */
async function loadWeather(lat, lon) {
  const tempUnit = unit === "c" ? "celsius" : "fahrenheit";
  const windUnit = unit === "c" ? "kmh" : "mph";

  const weatherURL = `https://api.open-meteo.com/v1/forecast
?latitude=${lat}&longitude=${lon}
&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,wind_speed_10m
&hourly=temperature_2m,weathercode
&daily=temperature_2m_max,weathercode
&temperature_unit=${tempUnit}
&wind_speed_unit=${windUnit}
&timezone=auto`;

  const airURL = `https://air-quality-api.open-meteo.com/v1/air-quality
?latitude=${lat}&longitude=${lon}
&current=us_aqi`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherURL),
    fetch(airURL)
  ]);

  const weather = await weatherRes.json();
  const air = await airRes.json();

  renderWeather(weather, air);
}

/* ===============================
   RENDER UI
================================ */
function renderWeather(w, air) {
  $("date").textContent = new Date().toDateString();
  $("temp").textContent = Math.round(w.current.temperature_2m) + "°";
  $("feels").textContent = Math.round(w.current.apparent_temperature) + "°";
  $("humidity").textContent = w.current.relative_humidity_2m + "%";
  $("wind").textContent =
    Math.round(w.current.wind_speed_10m) + (unit === "c" ? " km/h" : " mph");
  $("rain").textContent = w.current.precipitation + " mm";

  /* AQI */
  if (air?.current?.us_aqi !== undefined) {
    const aqi = air.current.us_aqi;
    let label = "Good";
    if (aqi > 50 && aqi <= 100) label = "Moderate";
    else if (aqi > 100 && aqi <= 150) label = "Unhealthy";
    else if (aqi > 150) label = "Poor";

    $("aqi").textContent = `AQI ${aqi} (${label})`;
  }

  /* Current Weather Icon */
  const icon = getWeatherIcon(w.current.weathercode);
  if ($("weatherIcon")) {
    $("weatherIcon").src = `assets/images/${icon}`;
  }

  /* Background + Animation */
 const weatherCode = w.current.weathercode;
const isDay = w.current.is_day === 1;

// Weather type
let weatherType = "sunny";
if (weatherCode >= 3 && weatherCode < 60) weatherType = "cloudy";
if (weatherCode >= 60) weatherType = "rain";

// Apply classes
document.body.className = `${weatherType} ${isDay ? "day" : "night"}`;

// Accent-aware animation
setWeatherAnimation(weatherCode);


  /* HOURLY TABLE */
  $("hourly").innerHTML = "";
  w.hourly.time.slice(0, 12).forEach((t, i) => {
    const hourIcon = getWeatherIcon(w.hourly.weathercode[i]);
    $("hourly").innerHTML += `
      <tr>
        <td>${t.split("T")[1]}</td>
        <td>
          <img src="assets/images/${hourIcon}" width="18">
          ${Math.round(w.hourly.temperature_2m[i])}°
        </td>
      </tr>
    `;
  });

  /* DAILY */
  $("daily").innerHTML = "";
  w.daily.time.slice(0, 7).forEach((d, i) => {
    const dailyIcon = getWeatherIcon(w.daily.weathercode[i]);
    $("daily").innerHTML += `
      <div>
        <strong>${d.slice(5)}</strong>
        <img src="assets/images/${dailyIcon}" width="26">
        <p>${Math.round(w.daily.temperature_2m_max[i])}°</p>
      </div>
    `;
  });

  drawChart(w.hourly);
}

/* ===============================
   CHART.JS
================================ */
function drawChart(hourly) {
  const canvas = document.getElementById("tempChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const labels = hourly.time.slice(0, 12).map(t => t.split("T")[1]);
  const temps = hourly.temperature_2m.slice(0, 12);

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: temps,
        borderColor: "#ffb703",
        backgroundColor: "rgba(255,183,3,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#b6c3ff" } },
        y: { ticks: { color: "#b6c3ff" } }
      }
    }
  });
}

/* ===============================
   SEARCH AUTOCOMPLETE
================================ */
$("searchInput").addEventListener("input", async (e) => {
  const list = $("suggestions");
  list.innerHTML = "";
  const q = e.target.value.trim();
  if (q.length < 2) return;

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=5`
  );
  const data = await res.json();

  data.results?.forEach((c) => {
    const div = document.createElement("div");
    div.textContent = `${c.name}, ${c.country}`;
    div.onclick = () => {
      list.innerHTML = "";
      $("searchInput").value = c.name;
      currentCoords = { latitude: c.latitude, longitude: c.longitude };
      $("location").textContent = `${c.name}, ${c.country}`;
      loadWeather(c.latitude, c.longitude);
    };
    list.appendChild(div);
  });
});

/* ===============================
   UNIT TOGGLE
================================ */
$("unitToggle").onclick = () => {
  unit = unit === "c" ? "f" : "c";
  $("unitToggle").textContent = unit === "c" ? "°C" : "°F";
  if (currentCoords) loadWeather(currentCoords.latitude, currentCoords.longitude);
};

/* ===============================
   CANVAS WEATHER ANIMATION
================================ */
const canvas = $("weatherCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let particles = [];
let weatherMode = "sunny";

function setWeatherBackground(code) {
  document.body.className =
    code < 3 ? "sunny" : code < 60 ? "cloudy" : "rain";
}

function setWeatherAnimation(code) {
  weatherMode = code < 3 ? "sunny" : code < 60 ? "cloudy" : "rain";
  particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: Math.random() * 2 + 1,
    size: Math.random() * 2 + 1
  }));
}

function animateWeather() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (weatherMode === "rain") {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    particles.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 14);
      ctx.stroke();
      p.y += p.speed * 4;
      if (p.y > canvas.height) p.y = 0;
    });
  }

  if (weatherMode === "cloudy") {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.speed * 0.3;
      if (p.x > canvas.width) p.x = 0;
    });
  }

  requestAnimationFrame(animateWeather);
}
animateWeather();
