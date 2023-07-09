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


const weather_API_KEY = "3f6b6e4d25a4a75d4fff9bce57a869c0";
const Days_of_the_week = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]


const getGEOcordinates = async() => {
    const pin_code = document.getElementById("pin-inp").value;
    const country_code = document.getElementById("country-inp").value;
    // console.log(pin_code);
    // console.log(country_code);
    const location_response = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${pin_code},${country_code}&appid=${weather_API_KEY}`)
    const data = await location_response.json();
    return data;
}

const getCurrentWeatherData = async() => {
    let coord = await getGEOcordinates();
    // console.log(coord);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coord["lat"]}&lon=${coord["lon"]}&appid=${weather_API_KEY}&units=metric`);

    const currentWeather = await response.json();
    return currentWeather;

}

const getHourlyForecast = async() => {
    let coord = await getGEOcordinates();
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coord["lat"]}&lon=${coord["lon"]}&appid=${weather_API_KEY}&units=metric`);
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
    currentForecastElement.querySelector(".temp").textContent = temp + "°";
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
        console.log(minTemp)

        if (index < 5) {
            dayWiseInfo += `<article class="day-wise-forecast">
                <h2>${index === 0 ? "today" : day}</h2>
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



document.addEventListener("DOMContentLoaded", async() => {
    getCountryISOcode();
    // const hourlyForecast = await getHourlyForecast(currentWeather);

})



const loadEntireData = async() => {
    const currentWeather = await getCurrentWeatherData();
    // console.log(currentWeather);
    await loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
}