import React, { useState, useEffect } from "react";
import { checkCoat } from "./util/api";
import "./App.css";
import { ShouldI } from "./components/ShouldI";
import { CommentSection } from "./components/CommentSection";
import { WeatherCard } from "./components/WeatherCard";
import { MapComponent } from "./components/MapComponent";

export function App() {
  const [shouldWearCoat, setShouldWearCoat] = useState(null);
  const [latLon, setLatLon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [customLocation, setCustomLocation] = useState(null);

  const updateLocation = React.useCallback(
    async (newLocation, isCustom = false) => {
      console.log("Updating location:", newLocation);
      setLatLon(newLocation);
      if (isCustom) {
        setCustomLocation({ ...newLocation });
      }
      try {
        setLoading(true);
        const data = await checkCoat(
          newLocation.latitude,
          newLocation.longitude,
        );
        setWeatherData(data);
        setShouldWearCoat(data.shouldWearCoat);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data", error);
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const initialLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          updateLocation(initialLocation);
        },
        (error) => {
          console.error("Error obtaining location:", error);
        },
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

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
        </div>
      </div>
    </div>
  );
}

export default App;
