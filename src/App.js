import React, { useState, useEffect } from 'react';
import { checkCoat } from './api';
import { WiDaySunny, WiHumidity, WiStrongWind } from 'react-icons/wi';
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
        {weatherData && <WeatherCard title={weatherData.main} temp={weatherData.temp} wind={weatherData.wind} humidity={weatherData.humidity} />}
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

function WeatherCard({ title, temp, wind, humidity }) {
  return (
    <div className="bg-white bg-opacity-90 p-5 rounded-lg shadow-lg text-left w-80">
      <div className="flex items-center mb-4">
        <WiDaySunny className="text-yellow-500 text-5xl mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
          <p className="text-gray-800">{temp}°C</p>
        </div>
      </div>
      <div className="flex justify-between text-gray-800">
        <div className="flex items-center">
          <WiHumidity className="text-blue-500 text-3xl mr-2" />
          <span>Humidity: {humidity}%</span>
        </div>
        <div className="flex items-center">
          <WiStrongWind className="text-green-500 text-3xl mr-2" />
          <span>Wind: {wind.speed}m/h</span>
        </div>
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
