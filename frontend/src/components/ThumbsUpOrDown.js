import React from "react"

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
