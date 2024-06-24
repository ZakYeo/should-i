import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 10,  // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get('/api/check-coat', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  /*const location = 'London';
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;*/
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  console.log(process.env.API_KEY)
  try {
    const response = await fetch(url);
    const weatherData = await response.json();
    if (!weatherData || weatherData.cod !== 200) {
      throw new Error('Failed to fetch weather data');
    }
    /* Example Weather Data Response Object
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

    const temperature = weatherData.main.temp;
    const shouldWearCoat = temperature < 15;
    console.log(weatherData);

    res.json({
      location: weatherData.name,
      temperature: `${temperature} °C`,
      shouldWearCoat,
      weather: weatherData.weather[0].description
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }

});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
