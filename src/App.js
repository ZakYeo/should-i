import React, { useState, useEffect } from 'react';
import { checkCoat, sendFeedback } from './api';
import { WiDaySunny, WiHumidity, WiStrongWind, WiDayCloudy, WiRain, WiSnow, WiThunderstorm, WiSprinkle, WiFog } from 'react-icons/wi';
import './App.css';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';


const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

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
          setShouldWearCoat(data.shouldWearCoat);
          setWeatherData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching coat status', error);
        }
      };
      fetchData();
    }
  }, [latLon]);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', overflow: 'hidden' }}>
      <video
        autoPlay
        loop
        muted
        style={{ position: 'absolute', width: 'auto', minWidth: '100%', minHeight: '100%', maxWidth: 'none', filter: 'blur(1px)' }}
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
        alignItems: 'stretch',
        justifyContent: 'space-between',
        fontFamily: 'Inter',
        width: '100%',
        maxWidth: '1120px'
      }}>
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>

          <div style={{
            flex: 1,
            padding: '0 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            gap: 10,
            backgroundColor: '#ffffff',
            opacity: '0.9',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'center',
            transition: 'all 0.3s ease-in-out'
          }}>
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
          <CommentSection />

        </div>
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 10,
          backgroundColor: '#ffffff',
          opacity: '0.9',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
          transition: 'all 0.3s ease-in-out'
        }}>
          {weatherData && <WeatherCard weatherData={weatherData} />}
          {latLon && <MapComponent lat={latLon.latitude} lon={latLon.longitude} />}
          <ThumbsUpOrDown />
        </div>
      </div>
    </div>
  );
}



function CommentSection() {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [thumbs, setThumbs] = useState({});

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = () => {
    if (username.trim() !== '' && comment.trim() !== '') {
      const newComment = { username: username, text: comment };
      setComments([...comments, newComment]);
      setComment('');
      setUsername('');
    }
  };

  const handleThumbUpOrDown = (commentIndex, type) => {
    setThumbs(prev => ({
      ...prev,
      [commentIndex]: type
    }));
  };



  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        width: '100%'
      }}>
        <div style={{ display: 'flex' }}>
          <p style={{ fontStyle: 'italic', color: '#4a5568', opacity: 0.8, visibility: comments.length > 0 ? 'visible' : 'hidden' }}>comments in your area:</p>
        </div>
        <div style={{
          minHeight: '200px',
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #4a5568',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: comments.length > 0 ? 'start' : 'center',
        }}>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div style={{
                display: 'flex', width: '100%', backgroundColor: 'red',
                backgroundColor: '#f7fafc',
                borderRadius: '5px',
                borderColor: '#e2e8f0',
                borderWidth: '1px',
                borderStyle: 'solid',
              }} key={index} >
                <p style={{
                  padding: '10px',
                  marginTop: '10px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-all',
                  width: '100%'
                }}>
                  <strong>{comment.username}: </strong>{comment.text}
                </p>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <button onClick={() => handleThumbUpOrDown(index, 'up')} style={{
                    fontSize: '15px',
                    color: thumbs[index] === "up" ? 'green' : 'black',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    height: 20,
                    width: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex'
                  }}>
                    <FaThumbsUp />
                  </button>
                  <button onClick={() => handleThumbUpOrDown(index, 'down')} style={{
                    fontSize: '15px',
                    color: thumbs[index] === "down" ? 'red' : 'black',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    height: 20,
                    width: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex'
                  }}>
                    <FaThumbsDown />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontStyle: 'italic', color: '#4a5568', opacity: 0.8, textAlign: 'center', width: '100%' }}>
              No comments to display in this area. <br /> Add one!
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #4a5568',
        }}>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Your username..."
            style={{ width: '100%', padding: '10px', borderRadius: '5px', borderColor: '#cbd5e0' }}
          />
          <textarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Leave your comment here..."
            style={{ width: '100%', padding: '10px', borderRadius: '5px', borderColor: '#cbd5e0', resize: 'none', height: '80px' }}
          />
          <button onClick={handleCommentSubmit} style={{
            alignSelf: 'flex-end',
            padding: '10px 20px',
            borderRadius: '5px',
            backgroundColor: '#4a5568',
            color: '#fff',
            border: 'none'
          }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}



function ThumbsUpOrDown() {
  const [vote, setVote] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const questionMessage = "Is this information accurate?";
  const feedbackMessage = "Thank you for your feedback";

  const handleVote = (type) => {
    setOpacity(0);  // Start fade out
    setTimeout(() => {
      if (vote === type) {
        setVote(null);
        setShowFeedback(false);

      } else {
        setVote(type);
        sendFeedback(type === "up" ? true : false)
        setShowFeedback(true);
      }
      setOpacity(1);  // Start fade in
    }, 500);
  };

  const renderText = (message, slide = false) => {
    return message.split('').map((char, index) => (
      <span key={index} style={{
        opacity: opacity,
        transition: 'opacity 0.5s ease',
        animation: slide ? `slide-in 0.5s ${index * 0.1}s ease-out forwards` : ''
      }}>
        {char}
      </span>
    ));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-end', fontStyle: 'italic', gap: 7, height: 30 }}>
      <span style={{
        fontSize: '16px',
        color: '#4a5568',
        transition: 'opacity 0.5s ease'
      }}>
        {showFeedback ? renderText(feedbackMessage, true) : renderText(questionMessage)}
      </span>
      {!showFeedback && (
        <div style={{ opacity: opacity, transition: 'opacity 0.5s ease' }}>
          <button onClick={() => handleVote('up')} style={{
            fontSize: '20px',
            color: vote === 'up' ? '#38a169' : 'black',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            padding: 5
          }}>
            <FaThumbsUp />
          </button>
          <button onClick={() => handleVote('down')} style={{
            fontSize: '20px',
            color: vote === 'down' ? '#e53e3e' : 'black',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            padding: 5
          }}>
            <FaThumbsDown />
          </button>
        </div>
      )}
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

function WeatherCard({ weatherData: { main, temp, wind, humidity, feels_like, description } }) {
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
    <div>
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

  const containerStyle = {
    width: '100%',
    height: '100%'
  };


  const circleOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#ADD8E6',
    fillOpacity: 0.2,
    center: { lat, lng: lon },
    radius: 2000,
  };

  return (
    <LoadScript
      googleMapsApiKey={MAPS_API_KEY}
      loadingElement={<div>Loading...</div>}
    >
      <div style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        width: '100%',
        height: '400px',
      }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: lat, lng: lon }}
          zoom={13}
        >
          <Marker position={{ lat: lat, lng: lon }} />
          <Circle
            center={{ lat: lat, lng: lon }}
            options={circleOptions}
          />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}

export default App;
