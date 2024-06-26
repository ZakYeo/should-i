import React, { useState, useEffect } from 'react';
import { checkCoat } from './api';
import { WiDaySunny, WiHumidity, WiStrongWind, WiDayCloudy, WiRain, WiSnow, WiThunderstorm, WiSprinkle, WiFog } from 'react-icons/wi';
import './App.css';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';



const MAPS_API_KEY = ""

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
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      <video
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          width: 'auto',
          minWidth: '100%',
          minHeight: '100%',
          maxWidth: 'none',
          filter: 'blur(1px)'
        }}
      >
        <source src={`${process.env.PUBLIC_URL}/bg-clouds.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={{
        position: 'relative',
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Inter',
        width: '100%',
        maxWidth: '1120px'
      }}>
        <div style={{ flex: 1, textAlign: 'left', padding: '0 40px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px', color: '#4a5568', textShadow: '0px 4px 4px rgba(0,0,0,0.25)' }}>Should you wear a coat today?</h1>
          {loading ? (
            <Spinner />
          ) : shouldWearCoat !== null ? (
            <p style={{ fontSize: '24px', fontWeight: 'medium', marginBottom: '8px', color: shouldWearCoat ? '#38a169' : '#e53e3e' }}>
              {shouldWearCoat ? 'Yes, you should wear a coat!' : 'No, you don’t need a coat!'}
            </p>
          ) : (
            <p style={{ fontSize: '24px', color: '#cbd5e0' }}>Unable to fetch data.</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          {weatherData && <WeatherCard weatherData={weatherData} />}
          {latLon && <MapComponent lat={latLon.latitude} lon={latLon.longitude} />}
        </div>
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
    <div style={{
      backgroundColor: '#ffffff',
      opacity: '0.9',
      padding: '32px',
      borderRadius: '10px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      width: '400px',
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {weatherIcon[main] || <WiDaySunny className="text-yellow-500 text-5xl" />}
          <div style={{ marginLeft: '16px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#2b6cb0' }}>{main}</h2>
            <p style={{ fontSize: '20px', color: '#4a5568' }}>Feels like: {feels_like}°C</p>
            <p style={{ fontSize: '18px', color: '#4a5568' }}>{temp}°C</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', color: '#4a5568', fontSize: '18px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WiHumidity className="text-blue-500 text-4xl mr-2" />
          <span>Humidity: {humidity}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WiStrongWind className="text-green-500 text-4xl mr-2" />
          <span>Wind: {wind.speed} m/h</span>
        </div>
      </div>
      <div style={{ fontStyle: 'italic', textAlign: 'center', color: '#718096', fontSize: '18px', marginTop: '8px' }}>
        "{description}"
      </div>
    </div>
  );
}

function MapComponent({ lat, lon }) {
  const [mapData, setMapData] = useState(null);
  console.log(lat)
  console.log(lon)


  const containerStyle = {
    width: '400px',
    height: '400px'
  };

  useEffect(() => {
    fetchMapData();
  }, []);


  const fetchMapData = async () => {
    const response = await fetch(`/api/mapsdata?lat=-34.397&lon=150.644`);
    const data = await response.json();
    setMapData(data);
  };

  return (
    <LoadScript
      googleMapsApiKey={MAPS_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: lat, lng: lon }}

        zoom={10}
      >
        { /* Child components, like markers or circles */}
        {mapData && mapData.results.map(place => (
          <Marker key={place.id} position={{ lat: place.geometry.location.lat, lng: place.geometry.location.lng }} />
        ))}
      </GoogleMap>
    </LoadScript>
  )
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
