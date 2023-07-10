// import jsonData from './data.json' assert { type: 'JSON' };


const getCountryISOcode = async() => {
    var select = document.getElementById('country-inp');
    var html = "<option value='' disabled selected>Select your option</option>";
    await fetch("./data.json")
        .then(response => response.json())
        .then(jsonData => {
            for (var key in jsonData) {
                html += "<option value=" + jsonData[key]['Code'] + ">" + jsonData[key]['Name'] + "</option>"
            }
            select.innerHTML = html;
        });


}

const IP_location_api_key = "5de49f4f-d3fc-4314-afba-bc49584fb7a8";



const getLocation = async() => {
    const ip_location_response = await fetch(`http://ip-api.com/json`)
    const ip_data = await ip_location_response.json();
    return ip_data;
}


const weather_API_KEY = "3f6b6e4d25a4a75d4fff9bce57a869c0";
const Days_of_the_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


const getGEOcordinates = async() => {
    const pin_code = document.getElementById("pin-inp").value;
    const country_code = document.getElementById("country-inp").value;
    // console.log(pin_code);
    // console.log(country_code);
    const location_response = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${pin_code},${country_code}&appid=${weather_API_KEY}`)
    const data = await location_response.json();
    return data;
}

const getCurrentWeatherData = async(lat, lon) => {

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weather_API_KEY}&units=metric`);

    const currentWeather = await response.json();
    return currentWeather;

}

const getHourlyForecast = async(lat, lon) => {

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weather_API_KEY}&units=metric`);
    const data = await response.json();
    return data.list.map(forecast => {
        const { main: { temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return { temp, temp_max, temp_min, dt, dt_txt, description, icon };
    })

}

const formatTemp = (temp) => `${temp?.toFixed(1)}`;

const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".curr-city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = temp + "°C";
    currentForecastElement.querySelector(".desc").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemp(temp_max)}° L:${formatTemp(temp_min)}°`;
    return currentForecastElement;
}

const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`

const loadHourlyForecast = ({ main: { temp: tempNow }, weather: [{ icon: iconNow }] }, hourlyForecast) => {
    // console.log(hourlyForecast);
    const timeFormatter = Intl.DateTimeFormat("en", {
        hour12: true,
        hour: "numeric"
    })
    let dateFor12Hours = hourlyForecast.slice(1, 13);
    // let dateFor12Hours = hourlyForecast.slice(2, 12);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = `<article>
    <h2 class="time">Now</h2>
    <img class="icon" src="${createIconUrl(iconNow)}" alt="icon"/>
    <p class="hourly-temp">${formatTemp(tempNow)+"°"}</p>
</article>`;

    for (let { temp, icon, dt_txt }
        of dateFor12Hours) {
        innerHTMLString += `<article>
        <h2 class="time">${timeFormatter.format(new Date(dt_txt))}</h2>
        <img class="icon" src="${createIconUrl(icon)}" alt="icon"/>
        <p class="hourly-temp">${formatTemp(temp)+"°"}</p>
    </article>`
            // <h2 class="time">${dt_txt.split(" ")[1].slice(0, 5)}</h2>
            // console.log(dt_txt.split(" ")[1])

    }
    hourlyContainer.innerHTML = innerHTMLString;
}

const calculateDayWiseForecast = (hourlyForecast) => {
    let dayWiseForecast = new Map();
    for (let forecast of hourlyForecast) {
        const [date] = forecast.dt_txt.split(" ");
        const dayOfTheWeek = Days_of_the_week[new Date(date).getDay()]
            // console.log(dayOfTheWeek);
        if (dayWiseForecast.has(dayOfTheWeek)) {
            let forecastOfTheDay = dayWiseForecast.get(dayOfTheWeek);
            forecastOfTheDay.push(forecast);
            dayWiseForecast.set(dayOfTheWeek, forecastOfTheDay);
        } else {
            dayWiseForecast.set(dayOfTheWeek, [forecast]);
        }
    }

    for (let [key, value] of dayWiseForecast) {
        let minTemp = Math.min(...Array.from(value, val => val.temp_min))
        let maxTemp = Math.max(...Array.from(value, val => val.temp_max))

        dayWiseForecast.set(key, { minTemp, maxTemp, icon: value.find(v => v.icon).icon })
    }
    return dayWiseForecast;
}
const loadFiveDayForecast = (hourlyForecast) => {
    // console.log(hourlyForecast)
    const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
    const container = document.querySelector(".five-day-forecast-container");
    let dayWiseInfo = "";

    Array.from(dayWiseForecast).map(([day, { minTemp, maxTemp, icon }], index) => {
        if (index < 5) {
            dayWiseInfo += `<article class="day-wise-forecast">
                <h2>${index === 0 ? "Today" : day}</h2>
                <img class="icon" src="${createIconUrl(icon)}" alt="icon for the forecast" />
                <p class="min-temp">${minTemp}</p>
                <p class="max-temp">${maxTemp}</p>
            </article>`
        }

    });
    container.innerHTML = dayWiseInfo;

}


const loadFeelsLike = ({ main: { feels_like } }) => {
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemp(feels_like);
}


const loadHumidity = ({ main: { humidity } }) => {
    let container = document.querySelector("#humidity");
    container.querySelector(".humid-value").textContent = `${humidity} %`;
}

const getLocationGps = () => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        loadEntireData(lat, lon);
    }, error => console.log(error))
}

document.addEventListener("DOMContentLoaded", async() => {

    var currentTime = new Date().getHours();
    if (7 <= currentTime && currentTime < 20) {
        document.body.style.backgroundImage = "url('weather-images/clearsky.gif')";
        document.querySelector(".container").style.background = "#6ca1bdde";
    } else {
        document.body.style.backgroundImage = "url('weather-images/clearnight.gif')";
        document.querySelector(".container").style.background = "#8b8b8bde";
    }


    getCountryISOcode();
    getLocationGps();
    if (!navigator.geolocation) {
        loadCoords(2);
    }
    // const ip_data = await getLocation();
    // console.log(ip_data);

})

const loadCoords = async(flag) => {

    let coord, lat, lon;
    if (flag === 1) {
        coord = await getGEOcordinates();
        lat = coord["lat"];
        lon = coord["lon"];
    } else if (flag === 2) {
        coord = await getLocation();
        lat = coord["lat"];
        lon = coord["lon"];
    }

    loadEntireData(lat, lon);
}

const changeImage = () => {
    const fewclouds = ["few clouds", "scattered clouds"];
    const scatteredclouds = ["broken clouds"];
    const denseclouds = ["overcast clouds"];
    const snow = ["snow", "light snow", "heavy snow", "sleet", "light shower sleet", "shower sleet", "light rain and snow", "rain and snow", "shower snow", "heavy shower snow"];
    const thunderstorm = ["thunderstorm with light rain", "thunderstorm with rain", "thunderstorm with heavy rain", "light thunderstorm", "thunderstorm", "heavy thunderstorm", "ragged thunderstorm", "thunderstorm with light drizzle", "thunderstorm with drizzle", "thunderstorm with heavy drizzle"];
    const shower_rain = ["light intensity drizzle", "drizzle", "heavy intensity drizzle", "light intensity drizzle rain", "drizzle rain", "heavy intensity drizzle rain", "shower rain and drizzle", "heavy shower rain and drizzle", "shower drizzle", "shower rain"];
    const rain = ["light rain", "moderate rain", "heavy intensity rain", "very heavy rain", "extreme rain", "freezing rain", "light intensity shower rain", "heavy intensity shower rain", "ragged shower rain"];
    const mist = ["mist", "smoke", "haze", "sand/dust whirls", "fog"];
    const tornado = ["sand", "dust", "volcanic ash", "squalls", "tornado"];

    const articleDesc = document.getElementsByClassName('desc')[0].innerText;
    const articleBack = document.getElementById('current-forecast');
    if (fewclouds.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/fewclouds.gif')";
    } else if (scatteredclouds.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/scatteredclouds.gif')";
    } else if (denseclouds.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/densecloud.gif')";
    } else if (snow.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/snow.gif')";
    } else if (thunderstorm.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/thunderstorm.gif')";
    } else if (shower_rain.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/showerrain.gif')";
    } else if (rain.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/rain.gif')";
    } else if (mist.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/mist.gif')";
    } else if (tornado.includes(articleDesc)) {
        articleBack.style.backgroundImage = "url('weather-images/sand_storm.gif')";
    } else {
        articleBack.style.backgroundImage = "url('weather-images/clearsky.gif')";
    }


    articleBack.style.backgroundSize = "cover";
    articleBack.style.backgroundRepeat = "no-repeat";
    articleBack.style.backgroundPosition = "center";
}

const loadEntireData = async(lat, lon) => {

    const currentWeather = await getCurrentWeatherData(lat, lon);
    await loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(lat, lon);
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    changeImage();
}