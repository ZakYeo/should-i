import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { Spinner } from "./Spinner";
import { getNearbyComments, saveCommentToDB } from "../api";
import '../App.css'

export function CommentSection({
  lat,
  lon,
  setLatLon,
  customLocation,
  setCustomLocation,
  loading,
}) {
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("Your Location");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customLocation) {
      console.log("Custom location changed:", customLocation);
      setSelectedLocation("Custom Location");
    }
  }, [
    lat,
    lon,
    setLatLon,
    customLocation?.latitude,
    customLocation?.longitude,
  ]);

  const cities = {
    "Your Location": { lat, lon },
    "Custom Location": customLocation || { lat, lon },
    London: { lat: 51.5074, lon: -0.1278 },
    Brighton: { lat: 50.8225, lon: -0.1372 },
  };

  useEffect(() => {
    (async () => {
      const comments = await getNearbyComments(lat, lon);
      setComments(comments);
    })();
  }, [lat, lon]);

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);

    if (e.target.value === "Custom Location") {
      setLatLon(customLocation);
      setCustomLocation(customLocation);
    } else if (e.target.value === "Your Location") {
      // If "Your Location" is selected, use the initial geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const yourLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLatLon(yourLocation);
          setCustomLocation(null);
        },
        (error) => {
          console.error("Error obtaining location:", error);
        },
      );
    } else {
      const cityCoords = cities[e.target.value];
      setLatLon({ latitude: cityCoords.lat, longitude: cityCoords.lon });
      setCustomLocation(null);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (username.trim() === "" || comment.trim() === "") {
      alert("Username and comment cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    const result = await saveCommentToDB(username, comment, lat, lon);
    if (result.statusCode === 200) {
      setComments([
        ...comments,
        {
          UserName: username,
          Description: comment,
          ThumbsUp: 0,
          ThumbsDown: 0,
          Latitude: lat,
          Longitude: lon,
        },
      ]);
      setComment("");
      setUsername("");
    } else if (result.statusCode >= 400) {
      alert(`Error: ${result.data.message}`);
    }
    setIsSubmitting(false);
  };

  const handleThumbUpOrDown = (commentIndex, type) => {
    setComments(
      comments.map((comment, index) => {
        if (index === commentIndex) {
          if (type === "up") {
            return {
              ...comment,
              ThumbsUp: (comments[index].ThumbsUp += 1),
            };
          } else if (type === "down") {
            return {
              ...comment,
              ThumbsDown: (comments[index].ThumbsDown += 1),
            };
          }
        }
        return comment;
      }),
    );
  };

  return (
    <div style={{ width: "100%", marginTop: "20px" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <p
            style={{
              fontStyle: "italic",
              display: "flex",
              flex: 1,
              color: "#4a5568",
              opacity: 0.8,
              visibility:
                !loading && comments.length > 0 ? "visible" : "hidden",
            }}
          >
            comments in your area:
          </p>
          <div>
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                visibility: !loading ? "visible" : "hidden",
              }}
            >
              {Object.keys(cities).map((city) => {
                // Check if the city is "Custom Location" and only render it if customLocation is set
                if (city === "Custom Location" && !customLocation) {
                  return null;
                }
                return (
                  <option key={city} value={city}>
                    {city}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div
          style={{
            minHeight: "200px",
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #4a5568",
            display: "flex",
            flexDirection: "column",
            justifyContent: comments.length > 0 ? "start" : "center",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "200px",
                justifyContent: "center",
              }}
            >
              <Spinner />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment, index) => (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  backgroundColor: "#f7fafc",
                  borderRadius: "5px",
                  borderColor: "#e2e8f0",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                key={index}
              >
                <p
                  style={{
                    padding: "10px",
                    marginTop: "10px",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    wordBreak: "break-all",
                    width: "100%",
                  }}
                >
                  <strong>{comment.UserName}: </strong>
                  {comment.Description}
                </p>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <div>
                    <button
                      onClick={() => handleThumbUpOrDown(index, "up")}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                        height: 20,
                        width: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      <FaThumbsUp />
                    </button>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 900,
                      }}
                    >
                      {comment.ThumbsUp}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleThumbUpOrDown(index, "down")}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                        height: 20,
                        width: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      <FaThumbsDown />
                    </button>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 900,
                      }}
                    >
                      {comment.ThumbsDown}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                fontStyle: "italic",
                color: "#4a5568",
                opacity: 0.8,
                textAlign: "center",
                width: "100%",
              }}
            >
              No comments to display in this area. <br /> Add one!
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #4a5568",
          }}
        >
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Your username..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              borderColor: "#cbd5e0",
            }}
          />
          <textarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Leave your comment here..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              borderColor: "#cbd5e0",
              resize: "none",
              height: "80px",
            }}
          />
          <button
            onClick={!isSubmitting ? handleCommentSubmit : null}
            style={{
              alignSelf: "flex-end",
              padding: "10px 20px",
              borderRadius: "5px",
              backgroundColor: isSubmitting ? "#b2bec3" : "#4a5568",
              color: "#fff",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }} >
            <span style={{ visibility: 'hidden' }}>...</span>{/* To maintain 'Submit' position in button */}
            Submit
            <span className={isSubmitting ? "fade-animation" : ""} style={{ opacity: isSubmitting ? 1 : 0 }}>...</span>
          </button>
        </div>
      </div>
    </div >
  );
}

CommentSection.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  setLatLon: PropTypes.func,
  customLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  setCustomLocation: PropTypes.func,
  loading: PropTypes.bool,
};
