import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";

const serverUrl = "https://api.openweathermap.org/data/2.5";
const cityName = document.getElementById("input-country");
const apiKey = "f660a2fb1e4bad108d6160b7f58c555f";

const searchBtn = document.getElementById("searchBtn");
const favoriteBtn = document.querySelector(".favorite-btn");
const selectedCitiesContainer = document.getElementById("selected-cities");
const hourlyForecastContainer = document.querySelector(".hourly-forecast");

// Форматирование времени
function formatTime(unixTimestamp) {
  return new Date(unixTimestamp * 1000).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Обновление основного блока погоды
function updateMainWeather(data) {
  const tempCelsius = Math.round(data.main.temp - 273.15);
  const locationName = data.name;
  const feelsLike = Math.round(data.main.feels_like - 273.15);
  const sunrise = formatTime(data.sys.sunrise);
  const sunset = formatTime(data.sys.sunset);

  document.querySelector(".temp-value").textContent = `${tempCelsius}°`;
  document.querySelector(".location").textContent = `${locationName}`;
  document.getElementById(
    "feels-like"
  ).textContent = `Feels like: ${feelsLike}°`;
  document.getElementById("sunrise").textContent = `Sunrise: ${sunrise}`;
  document.getElementById("sunset").textContent = `Sunset: ${sunset}`;
}

// Обновление прогноза на ближайшие 3 часа
function updateHourlyForecast(data) {
  hourlyForecastContainer.innerHTML = ""; // Очищаем контейнер
  const forecastList = data.list.slice(0, 3); // Берем первые 3 часа

  forecastList.forEach((forecast) => {
    const hour = document.createElement("div");
    hour.classList.add("hour");

    const time = formatTime(forecast.dt);
    const temp = Math.round(forecast.main.temp - 273.15);
    const feelsLike = Math.round(forecast.main.feels_like - 273.15);
    const icon = forecast.weather[0].icon;

    hour.innerHTML = `
      <p>${time}</p>
      <p>Temperature: <span>${temp}°</span></p>
      <p>Feels like: <span>${feelsLike}°</span></p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" width="30" />
    `;
    hourlyForecastContainer.appendChild(hour);
  });
}

// Получение данных о погоде
function fetchWeather(city) {
  const url = `${serverUrl}/weather?q=${city}&appid=${apiKey}`;
  return fetch(url).then((response) => response.json());
}

// Получение прогноза на 3 часа
function fetchHourlyForecast(city) {
  const url = `${serverUrl}/forecast?q=${city}&appid=${apiKey}`;
  return fetch(url).then((response) => response.json());
}

// Добавление города в избранное
function addCityToFavorites(cityName) {
  const selectedCity = document.createElement("li");
  selectedCity.classList.add("selected-city");
  selectedCity.innerHTML = `
    <p>${cityName}</p>
    <button class="remove-btn">X</button>
  `;

  // Удаление города из избранного
  const removeBtn = selectedCity.querySelector(".remove-btn");
  removeBtn.addEventListener("click", function () {
    removeCityFromFavorites(cityName);
    selectedCity.remove();
  });

  // Обновление основного блока при клике
  selectedCity.addEventListener("click", function () {
    fetchWeather(cityName)
      .then((data) => {
        if (data.cod === 200) {
          updateMainWeather(data);
        }
      })
      .catch((error) => {
        console.error("Ошибка при обновлении данных:", error);
        alert("Ошибка при обновлении данных.");
      });

    fetchHourlyForecast(cityName)
      .then((data) => {
        updateHourlyForecast(data);
      })
      .catch((error) => {
        console.error("Ошибка при обновлении прогноза:", error);
      });
  });

  selectedCitiesContainer.appendChild(selectedCity);
}

// Сохранение города в LocalStorage
function saveCityToFavorites(cityName) {
  const favorites = new Set(getFromLocalStorage("favorites") || []);
  favorites.add(cityName);
  saveToLocalStorage("favorites", Array.from(favorites));
}

// Удаление города из LocalStorage
function removeCityFromFavorites(cityName) {
  const favorites = new Set(getFromLocalStorage("favorites") || []);
  favorites.delete(cityName);
  saveToLocalStorage("favorites", Array.from(favorites));
}

// Загрузка избранных городов из LocalStorage
function loadFavorites() {
  const favorites = new Set(getFromLocalStorage("favorites") || []);
  favorites.forEach((city) => {
    addCityToFavorites(city);
  });
}

// Получение данных о погоде при поиске
function getWeather() {
  const city = cityName.value.trim();
  if (!city) {
    alert("Введите название города!");
    return;
  }

  fetchWeather(city)
    .then((data) => {
      if (data.cod !== 200) {
        alert("Город не найден!");
        return;
      }
      updateMainWeather(data);

      fetchHourlyForecast(city)
        .then((forecastData) => {
          updateHourlyForecast(forecastData);
        })
        .catch((error) => {
          console.error("Ошибка при получении прогноза:", error);
        });

      favoriteBtn.onclick = function () {
        const favorites = new Set(getFromLocalStorage("favorites") || []);

        if (favorites.has(data.name)) {
          alert("Этот город уже добавлен в избранное!");
          return;
        }

        // Добавляем город в избранное
        addCityToFavorites(data.name);
        saveCityToFavorites(data.name);
      };
    })
    .catch((error) => {
      console.error("Ошибка при загрузке данных:", error);
      alert("Не удалось загрузить данные. Проверьте название города.");
    });
}

// Инициализация
searchBtn.addEventListener("click", getWeather);
document.addEventListener("DOMContentLoaded", loadFavorites);
