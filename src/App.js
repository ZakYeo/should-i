import React, { useState, useEffect } from 'react';
import { checkCoat } from './api';
import { WiDaySunny, WiHumidity, WiStrongWind, WiDayCloudy, WiRain, WiSnow, WiThunderstorm, WiSprinkle, WiFog } from 'react-icons/wi';
import './App.css';

function App() {
  const [shouldWearCoat, setShouldWearCoat] = useState(null);
  const [latLon, setLatLon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatLon({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error obtaining location:', error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (latLon) {
      const fetchData = async () => {
        try {
          const data = await checkCoat(latLon.latitude, latLon.longitude);
          console.log(data);
          setShouldWearCoat(data.shouldWearCoat);
          setWeatherData(data);
          setLoading(false);
          console.log(data.wind.speed)
        } catch (error) {
          console.error('Error fetching coat status', error);
        }
      };
      fetchData();
    }
  }, [latLon]);
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute w-auto min-w-full min-h-full max-w-none filter blur-sm"
      >
        <source src={`${process.env.PUBLIC_URL}/bg-clouds.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative bg-white bg-opacity-70 p-10 rounded-lg shadow-lg text-center animate-fadeIn flex items-center font-inter">
        <div className="mr-10">
          <h1 className="text-5xl font-bold mb-4 text-gray-800 drop-shadow-lg">Should you wear a coat today?</h1>
          {loading ? (
            <Spinner />
          ) : shouldWearCoat !== null ? (
            <p className={`text-3xl font-medium mb-2 text-gray-800 drop-shadow-lg ${shouldWearCoat ? 'text-green-500' : 'text-red-500'}`}>
              {shouldWearCoat ? 'Yes, you should wear a coat!' : 'No, you don\'t need a coat!'}
            </p>
          ) : (
            <p className="text-3xl text-gray-400 drop-shadow-lg">Unable to fetch data.</p>
          )}
        </div>
        {weatherData && <WeatherCard weatherData={weatherData} />}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

function WeatherCard({ weatherData: { main, temp, wind, humidity, feels_like, temp_min, temp_max, description } }) {
  const weatherIcon = {
    'Clouds': <WiDayCloudy className="text-gray-500 text-5xl" />,
    'Clear': <WiDaySunny className="text-yellow-500 text-5xl" />,
    'Rain': <WiRain className="text-blue-500 text-5xl" />,
    'Snow': <WiSnow className="text-white text-5xl" />,
    'Thunderstorm': <WiThunderstorm className="text-purple-500 text-5xl" />,
    'Drizzle': <WiSprinkle className="text-blue-300 text-5xl" />,
    'Mist': <WiFog className="text-gray-400 text-5xl" />,
  };

  return (
    <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-xl text-left transition-all ease-in-out duration-300 hover:shadow-2xl">
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          {weatherIcon[main] || <WiDaySunny className="text-yellow-500 text-5xl" />}
          <div className="ml-4">
            <h2 className="text-3xl font-bold text-blue-800">{main}</h2>
            <p className="text-xl text-gray-800">Feels like: {feels_like}°C</p>
            <p className="text-lg text-gray-700">{temp}°C</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-gray-800 text-lg mb-4">
        <div className="flex items-center">
          <WiHumidity className="text-blue-500 text-4xl mr-2" />
          <span>Humidity: {humidity}%</span>
        </div>
        <div className="flex items-center">
          <WiStrongWind className="text-green-500 text-4xl mr-2" />
          <span>Wind: {wind.speed} m/h</span>
        </div>
      </div>
      <div className="italic text-center text-gray-600 text-lg">
        "{description}"
      </div>
    </div>
  );
}


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  console.log("Latitude: " + position.coords.latitude +
    " Longitude: " + position.coords.longitude);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}

export default App;
