// import jsonData from './data.json' assert { type: 'JSON' };


const getCountryISOcode = async () =>{
    var select = document.getElementById('country-inp');
    var html = "<option value='' disabled selected>Select your option</option>";
    await fetch("./data.json")
        .then(response => response.json())
        .then(jsonData => {
            for(var key in jsonData) {
                html += "<option value=" + jsonData[key]['Code']  + ">" +jsonData[key]['Name'] + "</option>"
            }
            select.innerHTML = html;
        });
    

}


const weather_API_KEY = "3f6b6e4d25a4a75d4fff9bce57a869c0";


const getGEOcordinates = async () => {
    const pin_code = document.getElementById("pin-inp").value;
    const country_code = document.getElementById("country-inp").value;
    console.log(pin_code);
    console.log(country_code);
    const location_response = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${pin_code},${country_code}&appid=${weather_API_KEY}`)
    const data = await location_response.json();
    return data;
}

const getCurrentWeatherData = async () => {
    let coord = await getGEOcordinates();
    // console.log(coord);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coord["lat"]}&lon=${coord["lon"]}&appid=${weather_API_KEY}&units=metric`);
    
    const currentWeather = await response.json();
    return currentWeather;
   
}

const getHourlyForecast = async () => {
    let coord = await getGEOcordinates();
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coord["lat"]}&lon=${coord["lon"]}&appid=${weather_API_KEY}&units=metric`);
    const data = await response.json();
    return data.list.map(forecast => {
        const { main: {temp, temp_max, temp_min }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return {temp, temp_max, temp_min, dt, dt_txt, description, icon};
    })
   
}

const formatTemp = (temp) => `${temp?.toFixed(1)}`;

const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min}, weather: [{description}]}) => {
const currentForecastElement = document.querySelector("#current-forecast");
currentForecastElement.querySelector(".curr-city").textContent = name;
currentForecastElement.querySelector(".temp"). textContent = temp+"°";
currentForecastElement.querySelector(".desc").textContent = description;
currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemp(temp_max)}° L:${formatTemp(temp_min)}°`;
return currentForecastElement;
}

const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`

const loadHourlyForecast = (hourlyForecast) => {
    // console.log(hourlyForecast);
    let dateFor12Hours = hourlyForecast.slice(1, 13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = ``;

    for(let {temp, icon, dt_txt} of dateFor12Hours){
        innerHTMLString += `<article>
        <h2 class="time">${dt_txt.split(" ")[1].slice(0, 5)}</h2>
        <img class="icon" src="${createIconUrl(icon)}" />
        <p class="hourly-temp">${formatTemp(temp)+"°"}</p>
    </article>`
    console.log(dt_txt.split(" ")[1])

    }
    hourlyContainer.innerHTML = innerHTMLString;
}

const loadFeelsLike = ({main: {feels_like}}) => {
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemp(feels_like);
}


const loadHumidity = ({main: {humidity}}) => {
    let container = document.querySelector("#humidity");
    container.querySelector(".humid-value").textContent = `${humidity} %`;
}


document.addEventListener("DOMContentLoaded", async ()=>{
    getCountryISOcode();
    // const hourlyForecast = await getHourlyForecast(currentWeather);
   
})


const loadEntireData = async () => {
    const currentWeather = await getCurrentWeatherData();
    console.log(currentWeather);
    await loadCurrentForecast(currentWeather);
    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
}
