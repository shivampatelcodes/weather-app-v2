import "./App.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import clear from "./icons/clear.png";
import cloud from "./icons/cloud.png";
import drizzle from "./icons/drizzle.png";
import rain from "./icons/rain.png";
import snow from "./icons/snow.png";
import windIcon from "./icons/wind.png"; // Wind icon
import humidityIcon from "./icons/humidity.png"; // Humidity icon

function App() {
  const API_KEY = "46647644-a5ca1c401d94abe9622557302";
  const OpenWeatherAPI_KEY = "cd72cecc6033636d9a71e2bec98fbc65";

  const [images, setImages] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [locationPermission, setLocationPermission] = useState("pending"); // pending, granted, denied
  const [isLoading, setIsLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false); // Toggle between current location and search mode

  useEffect(() => {
    // Fetch background image
    fetchBackgroundImage();
    
    // Get user's location on initial load
    getUserLocation();
  }, []);

  const fetchBackgroundImage = async () => {
    const API_URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
      "weather outside"
    )}&image_type=photo`;

    try {
      const response = await axios.get(API_URL);
      if (response.data.hits.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * response.data.hits.length
        );
        setImages(response.data.hits[randomIndex].largeImageURL);
      } else {
        console.log("No images found");
      }
    } catch (error) {
      console.log("Error fetching background image:", error);
    }
  };

  const getUserLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoordinates(latitude, longitude);
          setLocationPermission("granted");
          setIsLoading(false);
        },
        (error) => {
          console.log("Geolocation error:", error);
          setLocationPermission("denied");
          setIsLoading(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser");
      setLocationPermission("denied");
      setIsLoading(false);
    }
  };

  const fetchWeatherByCoordinates = async (lat, lon) => {
    const OpenWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OpenWeatherAPI_KEY}`;

    try {
      const response = await axios.get(OpenWeatherURL);
      if (response.data.weather) {
        setWeatherData({ ...response.data });
        const weatherDescription = response.data.weather[0].main.toLowerCase();
        console.log("Weather Data Response:", response.data);

        // Set the appropriate weather icon based on the weather description
        switch (weatherDescription) {
          case "clear":
            setWeatherIcon(clear);
            break;
          case "clouds":
            setWeatherIcon(cloud);
            break;
          case "drizzle":
            setWeatherIcon(drizzle);
            break;
          case "rain":
            setWeatherIcon(rain);
            break;
          case "snow":
            setWeatherIcon(snow);
            break;
          default:
            setWeatherIcon("https://openweathermap.org/img/wn/01d.png"); // Default icon from OpenWeather API
            break;
        }
      } else {
        console.log("No weather data available");
      }
    } catch (error) {
      console.log("Error fetching weather data:", error);
    }
  };

  const handleInputChange = async (inputValue) => {
    setSearchTerm(inputValue);

    if (inputValue.length >= 3) {
      const fetchGeoCoordinates_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        inputValue
      )}&limit=5&appid=${OpenWeatherAPI_KEY}`;

      try {
        const response = await axios.get(fetchGeoCoordinates_URL);
        console.log("Geo API Response:", response.data);

        if (response.data.length > 0) {
          const options = response.data.map((city) => ({
            label: `${city.name}, ${city.country}`,
            value: { lat: city.lat, lon: city.lon, name: city.name },
          }));
          setCityOptions(options);
        } else {
          setCityOptions([]);
        }
      } catch (error) {
        console.log("Error fetching city options:", error);
      }
    } else {
      setCityOptions([]);
    }
  };

  const handleCitySelect = async (selectedOption) => {
    const { lat, lon, name } = selectedOption.value;
    setSearchTerm(name); // Keep city name in the input field

    const OpenWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OpenWeatherAPI_KEY}`;

    try {
      const response = await axios.get(OpenWeatherURL);
      if (response.data.weather) {
        setWeatherData({ ...response.data, name }); // Store city name as well
        const weatherDescription = response.data.weather[0].main.toLowerCase();
        console.log("Weather Data Response:", response.data);

        // Set the appropriate weather icon based on the weather description
        switch (weatherDescription) {
          case "clear":
            setWeatherIcon(clear);
            break;
          case "clouds":
            setWeatherIcon(cloud);
            break;
          case "drizzle":
            setWeatherIcon(drizzle);
            break;
          case "rain":
            setWeatherIcon(rain);
            break;
          case "snow":
            setWeatherIcon(snow);
            break;
          default:
            setWeatherIcon("https://openweathermap.org/img/wn/01d.png"); // Default icon from OpenWeather API
            break;
        }
      } else {
        console.log("No weather data available");
      }
    } catch (error) {
      console.log("Error fetching weather data:", error);
    }
  };

  const convertKelvin = (temperatureKelvin) => {
    const temperatureCelsius = temperatureKelvin - 273.15;
    return Math.round(temperatureCelsius); // Using Math.round for temperature
  };

  const toggleSearchMode = () => {
    setSearchMode(!searchMode);
    if (!searchMode) {
      // Switching to search mode
      setSearchTerm("");
    } else {
      // Switching back to current location
      getUserLocation();
    }
  };

  const renderPermissionRequest = () => {
    return (
      <div className="text-center text-white mt-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Location Access Required</h2>
        <p className="mb-4">Please allow access to your location to display local weather information.</p>
        <button 
          onClick={getUserLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Grant Location Access
        </button>
        <button
          onClick={() => setSearchMode(true)}
          className="mt-4 text-white underline"
        >
          Or search for a location manually
        </button>
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="text-center text-white">
        <div className="animate-pulse">
          <div className="h-24 w-24 mx-auto bg-white bg-opacity-30 rounded-full mb-4"></div>
          <div className="h-8 w-40 mx-auto bg-white bg-opacity-30 rounded mb-2"></div>
          <div className="h-6 w-32 mx-auto bg-white bg-opacity-30 rounded mb-8"></div>
          <div className="flex justify-between">
            <div className="h-6 w-28 bg-white bg-opacity-30 rounded"></div>
            <div className="h-6 w-28 bg-white bg-opacity-30 rounded"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div
        className="w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${images})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-4/5 xl:w-1/3 h-auto flex flex-col rounded-3xl shadow-lg p-8 items-center glass-card">
          <div className="w-full flex justify-between items-center mb-4">
            <h1 className="text-3xl text-white font-bold drop-shadow-lg">
              Weather Finder
            </h1>
            {locationPermission === "granted" && (
              <button 
                onClick={toggleSearchMode}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors duration-300"
              >
                {searchMode ? "Current Location" : "Search Other Locations"}
              </button>
            )}
          </div>

          {searchMode && (
            <Select
              inputValue={searchTerm}
              onInputChange={handleInputChange}
              options={cityOptions}
              onChange={handleCitySelect}
              placeholder="Search City, Country"
              noOptionsMessage={() => "No cities found"}
              className="w-full p-2 rounded-md mb-4 glass-select"
            />
          )}

          {isLoading ? (
            renderLoadingState()
          ) : locationPermission === "denied" && !searchMode ? (
            renderPermissionRequest()
          ) : (
            <div className="text-center text-white mt-4 flex flex-col weather-info">
              {weatherIcon && (
                <img
                  src={weatherIcon}
                  alt="Weather Icon"
                  className="rounded-md mt-2 mb-4 mx-auto w-24 h-24"
                />
              )}
              {weatherData.main && (
                <>
                  <span className="block text-5xl font-bold">
                    {convertKelvin(weatherData.main.temp)}°C
                  </span>
                  <span className="block text-2xl font-light p-1">
                    {weatherData.name}
                  </span>
                  <span className="block text-xl font-light mb-4">
                    {weatherData.weather && weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1)}
                  </span>
                </>
              )}
              {weatherData.main && (
                <div className="mt-4 w-full flex justify-between items-center space-x-10">
                  <div className="flex items-center text-xl">
                    <img
                      src={humidityIcon}
                      alt="Humidity"
                      className="w-5 h-5 mr-2"
                    />
                    <span>
                      Humidity: {Math.round(weatherData.main.humidity)}%
                    </span>
                  </div>
                  <div className="flex items-center text-xl">
                    <img
                      src={windIcon}
                      alt="Wind Speed"
                      className="w-5 h-5 mr-2"
                    />
                    <span>
                      Wind: {Math.round(weatherData.wind.speed)} m/s
                    </span>
                  </div>
                </div>
              )}
              {weatherData.main && (
                <div className="mt-4 w-full flex justify-between items-center space-x-10">
                  <div className="flex items-center text-xl">
                    <span>
                      Min: {convertKelvin(weatherData.main.temp_min)}°C
                    </span>
                  </div>
                  <div className="flex items-center text-xl">
                    <span>
                      Max: {convertKelvin(weatherData.main.temp_max)}°C
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
