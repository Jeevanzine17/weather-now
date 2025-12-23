
# 🌦️ Weather Now — Smart Weather Web App

Weather Now is a modern, responsive weather web application that provides real-time weather data, air quality information, and forecasts using geolocation and city search. The app focuses on clean UI, smooth animations, and an intuitive user experience.

---

## 🚀 Features

* 📍 **Automatic Location Detection**

  * Uses browser geolocation to fetch weather for the user’s current city
  * Falls back gracefully if permission is denied

* 🔍 **City Search with Autocomplete**

  * Search cities worldwide
  * Dropdown suggestions powered by Open-Meteo Geocoding API

* 🌡️ **Current Weather Information**

  * Temperature
  * Feels-like temperature
  * Humidity
  * Wind speed
  * Precipitation

* 📊 **Temperature Trend Chart**

  * Hourly temperature visualized using **Chart.js**
  * Smooth, responsive line graph

* 🗓️ **Forecasts**

  * Hourly forecast (vertical table format)
  * 7-day daily forecast cards

* 🌬️ **Air Quality Index (AQI)**

  * Displays AQI value with human-readable categories:

    * Good
    * Moderate
    * Unhealthy
    * Poor

* 🌤️ **Dynamic Weather Icons**

  * Weather-based icons (sunny, cloudy, rain, storm, snow)
  * Icons update automatically based on conditions

* 🎨 **Soothing UI & Animations**

  * Eye-friendly color palette
  * Subtle hover effects
  * Floating weather icon animation
  * Canvas-based rain / cloud effects

* 📱 **Fully Responsive**

  * Optimized for desktop, tablet, and mobile screens

---

## 🛠️ Tech Stack

* **HTML5**
* **CSS3**

  * CSS variables
  * Responsive Grid & Flexbox
* **JavaScript (Vanilla)**
* **Chart.js**
* **Open-Meteo APIs**

  * Weather Forecast API
  * Air Quality API
  * Geocoding API
* **OpenStreetMap (Nominatim)** for reverse geocoding

---

## 📁 Project Structure

```
weather-now/
├── index.html
├── style.css
├── app.js
├── assets/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── icon-sunny.webp
│   │   ├── icon-cloudy.webp
│   │   ├── icon-rain.webp
│   │   └── ...
│   └── fonts/
└── README.md
```

---

## ⚙️ How It Works (High Level)

1. On page load:

   * Browser asks for location access
   * Latitude & longitude are used to fetch weather + AQI data

2. Weather data is rendered into:

   * Current weather card
   * Metrics grid
   * Hourly table
   * Daily forecast cards
   * Temperature chart

3. Weather conditions control:

   * Icons
   * Canvas animations
   * Background styling

4. Search allows users to override location and view weather for any city.

---

## 📌 Key Learnings

* Working with multiple public APIs together
* Handling geolocation permissions and fallbacks
* Mapping raw weather codes to meaningful UI states
* Canvas animations layered behind UI
* Chart.js integration with dynamic data
* Writing maintainable, modular JavaScript
* Building responsive layouts without frameworks

---


## 👤 Author

**Jivan Zine**
 
Weather Now  Personal Project

