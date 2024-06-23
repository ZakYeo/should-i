import express from 'express'
import cors from 'cors'
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.get('/api/check-coat', (req, res) => {
  // Placeholder logic for checking weather and determining if a coat is needed
  const shouldWearCoat = true; // This would be determined by actual weather data
  res.json({ shouldWearCoat });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
