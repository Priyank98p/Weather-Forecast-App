
let cityInput = document.getElementById("city_Input"),
    searchBtn = document.getElementById("searchBtn"),
    locationBtn = document.getElementById("locationBtn"),
    api_key = 'a49de94c0e55db16a2da832383a3e935',
    currentWeatherCard = document.querySelectorAll(".left-section .card")[0],
    fiveDaysForecastCard = document.querySelector(".day-forecast"),
    api_card = document.querySelectorAll(".highlights .card")[0],
    sunrise_card = document.querySelectorAll(".highlights .card")[1],
    humidityVal = document.getElementById("humidityVal"),
    pressureVal = document.getElementById("pressureVal"),
    visibilityVal = document.getElementById("visibilityVal"),
    windspeedVal = document.getElementById("windspeedVal"),
    feelsVal = document.getElementById("feelsVal"),
    hourlyForecastCard = document.querySelector(".hourly-forecast"),
    aqiList = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

function getWeatherDetails(name, lat, lon, country, state) {
    let weather_api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    let forecast_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    let airPollution_api_url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    fetch(airPollution_api_url).then(res => res.json()).then(data => {
        console.log(data)
        let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
        api_card.innerHTML = `
          <div class="card-head">
                            <p>Air Quality Index</p>
                            <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
                        </div>
                        <div class="air-indices">
                            <i class="fa-regular fa-wind fa-3x"></i>
                            <div class="items">
                                <p>PM2.5</p>
                                <h2>${pm2_5.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>PM10</p>
                                <h2>${pm10.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>SO2</p>
                                <h2>${so2.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>CO</p>
                                <h2>${co.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>NO</p>
                                <h2>${no.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>NO2</p>
                                <h2>${no2.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>NH3</p>
                                <h2>${nh3.toFixed(1)}</h2>
                            </div>
                            <div class="items">
                                <p>O3</p>
                                <h2>${o3.toFixed(1)}</h2>
                            </div>
                        </div>`
    })
    // Fetch current weather
    fetch(weather_api_url)
        .then(res => res.json())
        .then(data => {
            
            let date = new Date();
            let isNight = data.weather[0].icon.includes("n");
            let condition = data.weather[0].main.toLowerCase();
            if (isNight && condition === "clouds") {
                setWeatherBackground("clouds_night");
            } else if (isNight) {
                setWeatherBackground("night");
            } else {
                setWeatherBackground(condition);
            }
            currentWeatherCard.innerHTML = `
            <div class="current-weather">
                        <div class="details">
                            <p>Now</p>
                            <h2>${data.main.temp.toFixed(2)}.&deg;C</h2>
                            <p>${data.weather[0].description}</p>
                        </div>
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                        </div>
                    </div>
                    <hr>
                    <div class="card-footer">
                        <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]},${date.getDate()},${months[date.getMonth()]} ${date.getFullYear()}</p>
                        <p><i class="fa-light fa-location-dot"></i> ${name},${country}</p>
                    </div>`;

            let { sunrise, sunset } = data.sys
            let { timezone, visibility } = data,
                { humidity, pressure, feels_like } = data.main,
                { speed } = data.wind,
                sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
                sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A')

            sunrise_card.innerHTML = `
                     <div class="card-head">
                            <p>Sunrise & Sunset</p>
                        </div>
                        <div class="sunrise-sunset">
                            <div class="items">
                                <div class="icons">
                                    <i class="fa-light fa-sunrise fa-4x"></i>
                                </div>
                                <div>
                                    <p>Sunrise</p>
                                    <h2>${sRiseTime}</h2>
                                </div>
                            </div>
                            <div class="items">
                                <div class="icons">
                                    <i class="fa-light fa-sunset fa-4x"></i>
                                </div>
                                <div>
                                    <p>Sunset</p>
                                    <h2>${sSetTime}</h2>
                                </div>
                            </div>
                        </div>
                    `;
            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure}hpa`;
            visibilityVal.innerHTML = `${visibility / 1000}km`;
            windspeedVal.innerHTML = `${(speed * 3.6).toFixed(1)}km/h`;
            feelsVal.innerHTML = `${(feels_like).toFixed(2)}&deg;C`;
        })
        .catch(() => {
            alert("Failed to fetch current weather");
        });

    // Fetch 5-day forecast
    fetch(forecast_api_url)
        .then(res => res.json())
        .then(data => {
            // Example:
            // data.list contains forecast every 3 hours (8 items = 1 day approx.)
            let hourlyForecast = data.list;
            hourlyForecastCard.innerHTML = '';
            for (let i = 0; i <= 7; i++) {
                let hrforecastDate = new Date(hourlyForecast[i].dt_txt);
                let hr = hrforecastDate.getHours();
                let a = 'AM';

                if (hr == 0) hr = 12;
                else if (hr >= 12) {
                    if (hr > 12) hr = hr - 12;
                    a = 'PM';
                }
                hourlyForecastCard.innerHTML += `
                <div class="card glass-card">
                        <p>${hr} ${a}</p>
                        <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="">
                        <p>${hourlyForecast[i].main.temp.toFixed(2)}&deg;C</p>
                    </div>`

            }
            let uniqueDaysForecast = [];
            let fiveDaysForecast = data.list.filter(forecast => {
                let forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueDaysForecast.includes(forecastDate)) {
                    return uniqueDaysForecast.push(forecastDate);
                }
            });

            fiveDaysForecastCard.innerHTML = ``;
            for (let i = 1; i < fiveDaysForecast.length; i++) {
                let date = new Date(fiveDaysForecast[i].dt_txt);
                fiveDaysForecastCard.innerHTML += `
                <div class="forecast-items">
                            <div class="icon-wrapper">
                                <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                                <span>${fiveDaysForecast[i].main.temp.toFixed(1)}&deg;C</span>
                            </div>
                            <p>${date.getDate()} ${months[date.getMonth()]}</p>
                            <p>${days[date.getDay()]}</p>
                        </div>`
            }
        })
        .catch(() => {
            alert("Failed to fetch forecast");
        });
}

searchBtn.addEventListener('click', () => {
    let cityName = cityInput.value.trim();
    if (!cityName) return;

    cityInput.value = '';

    let geocoding_api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

    fetch(geocoding_api_url)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                alert("City not found!");
                return;
            }
            let { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
        })
        .catch(() => {
            alert(`Failed to fetch coordinates for ${cityName}`);
        });
});

locationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
        let { latitude, longitude } = position.coords;
        let reverse_Geocoding_url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`

        fetch(reverse_Geocoding_url).then(res => res.json()).then(data => {
            let { name, country, state } = data[0];
            getWeatherDetails(name, latitude, longitude, country, state);
        }).catch(() => {
            alert("failed to fetch user coordinates");
        });
    }, error => {
        if (error.code === error.PERMISSION_DENIED) {
            alert("Geolocation permission denied. Please reset location permission to grant access again");
        }
    });
})

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});


const background = document.getElementById("weatherBackground");

function setWeatherBackground(weatherCondition) {
    let imageUrl = "";

    switch (weatherCondition.toLowerCase()) {
        case "clear":
            imageUrl = "images/clear.png";
            break;
        case "clouds":
            imageUrl = "images/cloudy.png";
            break;
        case "mist":
        case "fog":
            imageUrl = "images/mist.png";
            break;
        case "thunderstorm":
            imageUrl = "images/thunderstorm.png";
            break;
        case "night":
            imageUrl = "images/night.png"
            break;
        case "clouds_night":
            imageUrl = "images/cloud at night.png";
            break;
        case "snow":
            imageUrl = "images/snow.png";
            break;
        case "rain":
            imageUrl = "images/rain.png";
            break;
        default:
            imageUrl = "images/clear.png";
    }

    background.style.backgroundImage = `url('${imageUrl}')`;
}

window.addEventListener('load', () => locationBtn.click());