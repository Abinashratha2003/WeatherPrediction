const apikey = "934e7f704f5c9ad2c0b6272ef6a49e1e";

const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  feels_like = document.querySelector(".feels_like"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  Pressure = document.querySelector(".Pressure"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  search = document.querySelector("#search"),
  input = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "metric";
let hourlyorWeek = "weekly";
let lon = "";
let lat = "";
let city = "";

var g_data = null;
var g_forecast = null;

function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let dayString = days[now.getDay()];

  if (minute < 10) {
    minute = "0" + minute;
  }

  hour = hour % 12;
  if (hour > 12) {
    hour = hour - 12;
    if (hour < 10) {
      hour = "0" + hour;
    }
    return `${dayString}, ${hour}:${minute} AM`;
  } else {
    return `${dayString}, ${hour}:${minute} PM`;
  }
}

date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lon = position.coords.longitude;
      lat = position.coords.latitude;
      mainReport();
    });
  }
});

function searchByCity() {
  city = document.getElementById("query").value;

  mainReport();
  // weatherReport(data);
  document.getElementById("query").value = "";
}

function mainReport() {
  if (!city) {
    var url =
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&` +
      `lon=${lon}&appid=${apikey}&units=${currentUnit}`;
  } else {
    // var place = document.getElementById("query").value;
    var url =
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&` +
      `appid=${apikey}&units=${currentUnit}`;
  }

  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      // console.log(data);
      g_data = data;
      weatherReport(data);
    })
    .catch((err) => {
      console.error(err);
    });
}

function weatherReport(data) {
  var urlcast =
    `http://api.openweathermap.org/data/2.5/forecast?q=${data.name}&` +
    `appid=${apikey}&units=${currentUnit}`;

  fetch(urlcast)
    .then((res) => {
      return res.json();
    })
    .then((forecast) => {
      // console.log(forecast);
      g_forecast = forecast; // since forcast can only called by weather function so it is declared  as global variable
      todayhighlight(data);
      // }

      if (hourlyorWeek == "hourly") {
        updatehourlyForecast(forecast);
      } else {
        updateweeklyForecast(forecast);
      }
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

function todayhighlight(data) {
  // console.log(data);
  let TUnit = "";
  if (currentUnit == "metric") {
    TUnit = "°C";
  } else {
    TUnit = "°F";
  }
  temp.innerText = Math.round(data.main.temp) + TUnit;
  // console.log(data.main.temp);

  currentLocation.innerText = data.name + ", " + data.sys.country;

  condition.innerText = data.weather[0].description;

  rain.innerText = "Perc - " + data.clouds.all + "%";

  feels_like.innerText = Math.round(data.main.feels_like) + TUnit;

  windSpeed.innerText = data.wind.speed;

  humidity.innerText = data.main.humidity + "%";
  updateHumidityStatus(data.main.humidity);

  visibilty.innerText = convertVisibility(data.visibility);
  updateVisibiltyStatus(data.visibility);

  mainIcon.src = getIcon(data.weather[0].icon);

  sunRise.innerText = convertUnixTime(data.sys.sunrise);
  sunSet.innerText = convertUnixTime(data.sys.sunset);

  Pressure.innerText = convertPressure(data.main.pressure);
}

function updateweeklyForecast(forecast) {
  weatherCards.innerHTML = "";

  for (let i = 0; i < 35; i++) {
    var date = new Date(forecast.list[i].dt * 1000);
    var day = getDayName(date);

    let dayTemp_Min = Math.round(forecast.list[i].main.temp_min);
    let iconCondition = getIcon(forecast.list[i].weather[0].icon);
    i += 7;
    let dayTemp_Max = Math.round(forecast.list[i].main.temp_max);
    let card = document.createElement("div");
    card.classList.add("card");

    let TUnit = "";
    if (currentUnit == "metric") {
      TUnit = "°C";
    } else {
      TUnit = "°F";
    }

    card.innerHTML = `
                <h2 class="day-name">${day}</h2>
            <div class="card-icon">
                 <img src="${iconCondition}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp_Min}${TUnit}-${dayTemp_Max}${TUnit}</h2>
                
            </div>
  `;
    weatherCards.appendChild(card);
  }
}

function updatehourlyForecast(forecast) {
  weatherCards.innerHTML = "";

  for (let i = 0; i < 28; i++) {
    var date = new Date(forecast.list[i].dt * 1000);
    var timehour = date.getHours();
    timehour = getHour(timehour);

    let dayTemp_Min = Math.round(forecast.list[i].main.temp_min);
    let dayTemp_Max = Math.round(forecast.list[i].main.temp_max);
    let iconCondition = getIcon(forecast.list[i].weather[0].icon);
    let card = document.createElement("div");
    card.classList.add("card");

    let TUnit = "";
    if (currentUnit == "metric") {
      TUnit = "°C";
    } else {
      TUnit = "°F";
    }

    card.innerHTML = `
                <h2 class="day-name">${timehour}</h2>
            <div class="card-icon">
                 <img src="${iconCondition}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp_Min}${TUnit}-${dayTemp_Max}${TUnit}</h2>
                
            </div>
  `;
    weatherCards.appendChild(card);
  }
}

function getHour(hour) {
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:00 PM`;
  } else {
    return `${hour}:00 AM`;
  }
}

function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

function convertPressure(pressurehPa) {
  let pressureMmHg = pressurehPa * 0.750062;
  return pressureMmHg.toFixed(2);
}

function convertVisibility(visibilityMeters) {
  let visibilityKm = visibilityMeters / 1000;
  return visibilityKm.toFixed(2);
}

function getIcon(condition) {
  if (condition === "01d" || condition === "01n") {
    if (condition === "01d") {
      return "./icon/01d.png";
    } else {
      return "./icon/01n.png";
    }
  } else if (condition === "02d" || condition === "02n") {
    if (condition === "02d") {
      return "./icon/02d.png";
    } else {
      return "./icon/02n.png";
    }
  } else if (condition === "03d" || condition === "03n") {
    return "./icon/03d.png";
  } else if (condition === "04d" || condition === "04n") {
    return "./icon/04d.png";
  } else if (condition === "09d" || condition === "09n") {
    return "./icon/09d.png";
  } else if (condition === "10d" || condition === "10n") {
    if (condition === "10d") {
      return "./icon/10d.png";
    } else {
      return "./icon/10n.png";
    }
  } else if (condition === "11d" || condition === "11n") {
    return "./icon/11d.png";
  } else if (condition === "13d" || condition === "13n") {
    return "./icon/13d.png";
  } else {
    return "./icon/50d.png";
  }
}

input.addEventListener("keypress", function (e) {
  if (e.key == "Enter") {
    search.click();
  }
});

weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});
hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("imperial");
});

celciusBtn.addEventListener("click", () => {
  changeUnit("metric");
});

function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    if (unit === "metric") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    mainReport();
  }
}

function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
      // updateweeklyForecast(forecast);
      updatehourlyForecast(g_forecast);
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
      updateweeklyForecast(g_forecast);
      // updatehourlyForecast(forecast)
    }
  }
}

function convertUnixTime(unixTimestamp) {
  // Convert Unix timestamp to milliseconds
  let unixTimeMilliseconds = unixTimestamp * 1000;

  // Create a new JavaScript Date object based on the timestamp
  let date = new Date(unixTimeMilliseconds);

  // Get hours, minutes, and seconds from the Date object
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();

  if (hours > 12) {
    hours = hours - 12;
    let formattedTime = hours + ":" + minutes.substr(-2) + "PM";
    return formattedTime;
  } else {
    let formattedTime = hours + ":" + minutes.substr(-2) + "AM";
    return formattedTime;
  }
}
