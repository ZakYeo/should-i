import axios from "axios";

export const checkCoat = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `check-coat?lat=${latitude}&lon=${longitude}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error checking coat status", error);
    throw error;
  }
};

export const saveCommentToDB = async (
  userName,
  commentDescription,
  latitude,
  longitude,
) => {
  try {
    const response = await axios.post(
      "comment/save",
      {
        userName,
        commentDescription,
        latitude,
        longitude,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return { data: response.data, statusCode: response.status };
  } catch (error) {
    console.error("Error saving comment to DB", error);
    return { data: error.response?.data, statusCode: error.response?.status };
  }
};

export const getNearbyComments = async (latitude, longitude) => {
  try {
    const response = await axios.get("comment/get/nearby", {
      params: {
        lat: latitude,
        lon: longitude,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby comments:", error);
    throw error;
  }
};

export const updateCommentVote = async (commentId, voteType) => {
  try {
    const response = await axios.post(
      "comment/rate",
      {
        commentId,
        voteType, // "up" or "down"
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return { data: response.data, statusCode: response.status };
  } catch (error) {
    console.error("Error updating comment vote", error);
    return { data: error.response?.data, statusCode: error.response?.status };
  }
};
