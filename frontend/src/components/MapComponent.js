import React from "react";
import PropTypes from "prop-types";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";

const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export function MapComponent({ lat, lon, updateLocation }) {
  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  const circleOptions = {
    strokeColor: "black",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#ADD8E6",
    fillOpacity: 0.2,
    center: { lat, lng: lon },
    radius: 2000,
  };

  const handleMapDoubleClick = async (event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    await updateLocation(
      {
        latitude: newLat,
        longitude: newLng,
      },
      true,
    );
  };

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
  );
}

MapComponent.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  updateLocation: PropTypes.func,
};
