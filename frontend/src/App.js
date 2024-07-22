import React, { useState, useEffect } from "react"
import { checkCoat, getNearbyComments, saveCommentToDB } from "./api"
import {
  WiDaySunny,
  WiHumidity,
  WiStrongWind,
  WiDayCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiSprinkle,
  WiFog,
} from "react-icons/wi"
import "./App.css"
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api"
import PropTypes from "prop-types"
import { ShouldI } from "./components/ShouldI"
import { CommentSection } from "./components/CommentSection"
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"
const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

export function App() {
  const [shouldWearCoat, setShouldWearCoat] = useState(null)
  const [latLon, setLatLon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState(null)
  const [customLocation, setCustomLocation] = useState(null)

  const updateLocation = React.useCallback(
    async (newLocation, isCustom = false) => {
      console.log("Updating location:", newLocation)
      setLatLon(newLocation)
      if (isCustom) {
        setCustomLocation({ ...newLocation })
      }
      try {
        setLoading(true)
        const data = await checkCoat(
          newLocation.latitude,
          newLocation.longitude,
        )
        setWeatherData(data)
        setShouldWearCoat(data.shouldWearCoat)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching weather data", error)
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const initialLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          updateLocation(initialLocation)
        },
        (error) => {
          console.error("Error obtaining location:", error)
        },
      )
    } else {
      console.log("Geolocation is not supported by this browser.")
    }
  }, [])

  /*useEffect(() => {
    if (latLon) {
      const fetchData = async () => {
        try {
          const data = await checkCoat(latLon.latitude, latLon.longitude)
          setShouldWearCoat(data.shouldWearCoat)
          setWeatherData(data)
          setLoading(false)
        } catch (error) {
          console.error("Error fetching coat status", error)
        }
      }
      fetchData()
    }
  }, [latLon])*/
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <video
        autoPlay
        loop
        muted
        style={{
          position: "absolute",
          width: "auto",
          minWidth: "100%",
          minHeight: "100%",
          maxWidth: "none",
          filter: "blur(1px)",
        }}
      >
        <source
          src={`${process.env.PUBLIC_URL}/bg-clouds.mp4`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div
        style={{
          position: "relative",
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          fontFamily: "Inter",
          width: "100%",
          maxWidth: "1120px",
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "0 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <ShouldI loading={loading} shouldWearCoat={shouldWearCoat} />
          {latLon && (
            <CommentSection
              lat={latLon.latitude}
              lon={latLon.longitude}
              setLatLon={setLatLon}
              customLocation={customLocation}
              setCustomLocation={setCustomLocation}
              loading={loading}
            />
          )}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 10,
            backgroundColor: "#ffffff",
            opacity: "0.9",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            width: "100%",
            alignItems: "center",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <WeatherCard weatherData={weatherData} loading={loading} />
          {latLon && (
            <MapComponent
              key={`${latLon.latitude}-${latLon.longitude}`}
              lat={latLon.latitude}
              lon={latLon.longitude}
              setLatLon={setLatLon}
              updateLocation={updateLocation}
            />
          )}
          <ThumbsUpOrDown />
        </div>
      </div>
    </div>
  )
}


export function ThumbsUpOrDown() {
  const [vote, setVote] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [opacity, setOpacity] = useState(1)
  const questionMessage = "Is this information accurate?"
  const feedbackMessage = "Thank you for your feedback"

  const handleVote = (type) => {
    setOpacity(0) // Start fade out
    setTimeout(() => {
      if (vote === type) {
        setVote(null)
        setShowFeedback(false)
      } else {
        setVote(type)
        sendFeedback(type === "up" ? true : false)
        setShowFeedback(true)
      }
      setOpacity(1) // Start fade in
    }, 500)
  }

  const renderText = (message, slide = false) => {
    return message.split("").map((char, index) => (
      <span
        key={index}
        style={{
          opacity: opacity,
          transition: "opacity 0.5s ease",
          animation: slide
            ? `slide-in 0.5s ${index * 0.1}s ease-out forwards`
            : "",
        }}
      >
        {char}
      </span>
    ))
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "flex-end",
        fontStyle: "italic",
        gap: 7,
        height: 30,
      }}
    >
      <span
        style={{
          fontSize: "16px",
          color: "#4a5568",
          transition: "opacity 0.5s ease",
        }}
      >
        {showFeedback
          ? renderText(feedbackMessage, true)
          : renderText(questionMessage)}
      </span>
      {!showFeedback && (
        <div style={{ opacity: opacity, transition: "opacity 0.5s ease" }}>
          <button
            onClick={() => handleVote("up")}
            style={{
              fontSize: "20px",
              color: vote === "up" ? "#38a169" : "black",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              padding: 5,
            }}
          >
            <FaThumbsUp />
          </button>
          <button
            onClick={() => handleVote("down")}
            style={{
              fontSize: "20px",
              color: vote === "down" ? "#e53e3e" : "black",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              padding: 5,
            }}
          >
            <FaThumbsDown />
          </button>
        </div>
      )}
    </div>
  )
}
export function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
}

export function WeatherCard({ weatherData, loading }) {
  const weatherIcon = {
    Clouds: <WiDayCloudy className="text-gray-500 text-5xl" />,
    Clear: <WiDaySunny className="text-yellow-500 text-5xl" />,
    Rain: <WiRain className="text-blue-500 text-5xl" />,
    Snow: <WiSnow className="text-white text-5xl" />,
    Thunderstorm: <WiThunderstorm className="text-purple-500 text-5xl" />,
    Drizzle: <WiSprinkle className="text-blue-300 text-5xl" />,
    Mist: <WiFog className="text-gray-400 text-5xl" />,
  }

  const { main, temp, wind, humidity, feels_like, description } = weatherData
    ? weatherData
    : {}

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "40%",
        width: "100%",
      }}
    >
      {loading ? (
        <div>
          <Spinner
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {weatherIcon[main] || (
                <WiDaySunny className="text-yellow-500 text-5xl" />
              )}
              <div style={{ marginLeft: "16px" }}>
                <h2
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    color: "#2b6cb0",
                  }}
                >
                  {main}
                </h2>
                <p style={{ fontSize: "20px", color: "#4a5568" }}>
                  Feels like: {feels_like}°C
                </p>
                <p style={{ fontSize: "18px", color: "#4a5568" }}>{temp}°C</p>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              color: "#4a5568",
              fontSize: "18px",
              marginTop: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <WiHumidity className="text-blue-500 text-4xl mr-2" />
              <span>Humidity: {humidity}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <WiStrongWind className="text-green-500 text-4xl mr-2" />
              <span>Wind: {wind.speed} m/h</span>
            </div>
          </div>
          <div
            style={{
              fontStyle: "italic",
              textAlign: "center",
              color: "#718096",
              fontSize: "18px",
              marginTop: "8px",
            }}
          >
            &quot;{description}&quot;
          </div>
        </>
      )}
    </div>
  )
}

function MapComponent({ lat, lon, updateLocation }) {
  const containerStyle = {
    width: "100%",
    height: "100%",
  }

  const circleOptions = {
    strokeColor: "black",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#ADD8E6",
    fillOpacity: 0.2,
    center: { lat, lng: lon },
    radius: 2000,
  }

  const handleMapDoubleClick = async (event) => {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()
    await updateLocation(
      {
        latitude: newLat,
        longitude: newLng,
      },
      true,
    )
  }

  return (
    <LoadScript
      googleMapsApiKey={MAPS_API_KEY}
      loadingElement={<div>Loading...</div>}
    >
      <div
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          width: "100%",
          height: "400px",
        }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat, lng: lon }}
          zoom={13}
          onDblClick={handleMapDoubleClick}
        >
          <Marker position={{ lat, lng: lon }} />
          <Circle center={{ lat, lng: lon }} options={circleOptions} />
        </GoogleMap>
      </div>
    </LoadScript>
  )
}

WeatherCard.propTypes = {
  weatherData: PropTypes.shape({
    main: PropTypes.string,
    temp: PropTypes.number,
    wind: PropTypes.shape({
      speed: PropTypes.number,
    }),
    humidity: PropTypes.number,
    feels_like: PropTypes.number,
    description: PropTypes.string,
  }),
  lat: PropTypes.number,
  lon: PropTypes.number,
  loading: PropTypes.bool,
}

MapComponent.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  updateLocation: PropTypes.func,
}



export default App
