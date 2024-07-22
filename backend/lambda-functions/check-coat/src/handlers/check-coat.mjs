import fetch from "node-fetch"

const WEATHER_API_KEY = process.env.API_KEY
const LATITUDE_MINIMUM = -90;
const LATITUDE_MAXIMUM = 90;
const LONGITUDE_MINIMUM = -180;
const LONGITUDE_MAXIMUM = 180;

/**
 * Lambda to grab and returns weather data based on lat and lon from query parameters
 * Weather API returns a response body of the format:
 *
   {
    coord: { lon: -0.1257, lat: 51.5085 },
    weather: [
      { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }
    ],
    base: 'stations',
    main: {
      temp: 25.98,
      feels_like: 25.98,
      temp_min: 24.03,
      temp_max: 27.17,
      pressure: 1016,
      humidity: 54
    },
    visibility: 10000,
    wind: { speed: 3.58, deg: 45, gust: 4.47 },
    clouds: { all: 20 },
    dt: 1719249095,
    sys: {
      type: 2,
      id: 2075535,
      country: 'GB',
      sunrise: 1719200642,
      sunset: 1719260510
    },
    timezone: 3600,
    id: 2643743,
    name: 'London',
    cod: 200
  }
 */
export const handler = async (event) => {

  const { lat, lon } = event.queryStringParameters

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing latitude or longitude parameter' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  let parsedLatitude = parseFloat(lat);
  let parsedLongitude = parseFloat(lon);
  if (isNaN(lat) || isNaN(lon)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Latitude and longitude must be valid numbers' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  parsedLatitude = Number(parsedLatitude.toFixed(6));
  parsedLongitude = Number(parsedLongitude.toFixed(6));

  if (parsedLatitude < LATITUDE_MINIMUM || parsedLatitude > LATITUDE_MAXIMUM ||
    parsedLongitude < LONGITUDE_MINIMUM || parsedLongitude > LONGITUDE_MAXIMUM) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Latitude must be between -90 and 90, and longitude must be between -180 and 180' }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  let resp;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
  try {
    const response = await fetch(url)
    const weatherData = await response.json()
    console.log(response);
    if (!weatherData || weatherData.cod !== 200) {
      throw new Error("Failed to fetch weather data")
    }

    const shouldWearCoat = weatherData.main.feels_like < 15

    resp = {
      location: weatherData.name,
      shouldWearCoat,
      ...weatherData.weather[0],
      wind: weatherData.wind,
      ...weatherData.main,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: "Failed to fetch weather data"
      })
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      success: true,
      message: "Successfully returned weather data",
      ...resp
    })
  };
}
