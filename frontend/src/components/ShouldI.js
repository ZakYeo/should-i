import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"

import { Spinner } from "./Spinner"

export const ShouldI = ({ loading, shouldWearCoat }) => {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        gap: 10,
        backgroundColor: "#ffffff",
        opacity: "0.9",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        width: "100%",
        alignItems: "center",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <h1
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#4a5568",
          textShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        }}
      >
        Should you wear a coat today?
      </h1>
      {loading ? (
        <Spinner />
      ) : shouldWearCoat !== null ? (
        <p
          style={{
            fontSize: "24px",
            fontWeight: "medium",
            marginBottom: "8px",
            color: shouldWearCoat ? "#38a169" : "#e53e3e",
          }}
        >
          {shouldWearCoat
            ? "Yes, you should wear a coat!"
            : "No, you don’t need a coat!"}
        </p>
      ) : (
        <p style={{ fontSize: "24px", color: "#cbd5e0" }}>
          Unable to fetch data.
        </p>
      )}
    </div>
  )
}

ShouldI.propTypes = {
  loading: PropTypes.bool,
  shouldWearCoat: PropTypes.bool,
}
