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
        .then(response => response.json())
        .then(data =>{return data});
}

const getCurrentWeatherData = async () => {
    let coord = await getGEOcordinates();
    console.log(coord);
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weather_API_KEY}&units=metric`);
    
    // return response.json();
   
}

const getHourlyForecast = async ({name: city}) => {
    const response = await fetch(`https://pro.openweathermap.org/data/2.5/forecast/hourly?q=${city}&appid=${weather_API_KEY}&units=metric`);
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
currentForecastElement.querySelector(".temp"). textContent = temp;
currentForecastElement.querySelector(".desc").textContent = description;
currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemp(temp_max)} L:${formatTemp(temp_min)}`;
return currentForecastElement;
}

const loadHourlyForecast = (hourlyForecast) => {
    console.log(hourlyForecast);
    let dateFor12Hours = hourlyForecast.slice(1, 13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTML = ``;

    for(let {temp, icon, dt_txt} of dateFor12Hours){
        innerHTML += `<article>
        <h2 class="time"></h2>
        <img src="" alt="" class="icon">
        <p class="hourly-temp">temp</p>
    </article>`

    }
}

document.addEventListener("DOMContentLoaded", async ()=>{
    getCountryISOcode();
    // const currentWeather = await getCurrentWeatherData();
    // loadCurrentForecast(currentWeather);
    // const hourlyForecast = await getHourlyForecast(currentWeather);
   
})
