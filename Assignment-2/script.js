const historyContainer = document.getElementById("history");

const API_KEY = "3ae88f3d3187a6936201da30fac5c69c";

async function searchCity(cityFromHistory = null) {
    const input = document.getElementById("cityInput");
    const city = cityFromHistory || input.value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        
        document.getElementById("cityName").textContent = data.name + ", " + data.sys.country;
        document.getElementById("temp").textContent = data.main.temp + " °C";
        document.getElementById("weather").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = data.main.humidity + " %";
        document.getElementById("wind").textContent = data.wind.speed + " m/s";

        addToHistory(data.name);

        input.value = "";

    } catch (error) {
        alert(error.message);
    }
}

function addToHistory(city) {
    const existingButtons = [...historyContainer.children].map(btn => btn.textContent);

    if (existingButtons.includes(city)) return;

    const button = document.createElement("button");
    button.textContent = city;
    button.onclick = () => searchCity(city);
    historyContainer.appendChild(button);
}
