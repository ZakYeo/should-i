import React, { useState, useEffect } from 'react';
import { checkCoat } from './api';
import { WiDaySunny, WiHumidity, WiStrongWind } from 'react-icons/wi';
import './App.css';

function App() {
  const [shouldWearCoat, setShouldWearCoat] = useState(null);
  const [latLon, setLatLon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatLon({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLoading(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (latLon) {
      const fetchData = async () => {
        try {
          const data = await checkCoat(latLon.latitude, latLon.longitude);
          console.log(data);
          setShouldWearCoat(data.shouldWearCoat);
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
      <div className="relative bg-white bg-opacity-70 p-10 rounded-lg shadow-lg text-center animate-fadeIn flex items-center">
        <div className="mr-10">
          <h1 className="text-4xl font-bold mb-4 text-black drop-shadow-lg">Should you wear a coat today?</h1>
          {shouldWearCoat !== null ? (
            <p className={`text-2xl text-black drop-shadow-lg ${shouldWearCoat ? 'text-green-500' : 'text-red-500'}`}>
              {shouldWearCoat ? 'Yes, you should wear a coat!' : 'No, you don\'t need a coat!'}
            </p>
          ) : (
            <p className="text-2xl text-gray-200 drop-shadow-lg">Loading...</p>
          )}
        </div>
        <WeatherCard />
      </div>
    </div>
  );
}

function WeatherCard() {
  return (
    <div className="bg-white bg-opacity-90 p-5 rounded-lg shadow-lg text-left w-80">
      <div className="flex items-center mb-4">
        <WiDaySunny className="text-yellow-500 text-5xl mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-blue-800">Sunny</h2>
          <p className="text-gray-800">22°C</p>
        </div>
      </div>
      <div className="flex justify-between text-gray-800">
        <div className="flex items-center">
          <WiHumidity className="text-blue-500 text-3xl mr-2" />
          <span>Humidity: 45%</span>
        </div>
        <div className="flex items-center">
          <WiStrongWind className="text-green-500 text-3xl mr-2" />
          <span>Wind: 10 km/h</span>
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
