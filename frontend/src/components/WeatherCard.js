import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
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
import { Spinner } from "./Spinner"


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
