import React, { useState, useEffect } from "react"
import { checkCoat, getNearbyComments, saveCommentToDB } from "./api"
import "./App.css"
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"
import PropTypes from "prop-types"
import { ShouldI } from "./components/ShouldI"
import { CommentSection } from "./components/CommentSection"
import { WeatherCard } from "./components/WeatherCard"
import { MapComponent } from "./components/MapComponent"

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


export default App
