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

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 10,  // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get('/api/check-coat', async (req, res) => {
  const location = 'London';
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
  console.log(process.env.API_KEY)
  try {
    const response = await fetch(url);
    const weatherData = await response.json();
    console.log(weatherData);
    const temperature = weatherData.main.temp;

    const shouldWearCoat = temperature < 15; //TODO better logic here
    console.log(weatherData);
    res.json({
      location,
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
