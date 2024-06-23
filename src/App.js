import React, { useState, useEffect } from 'react';
import { checkCoat } from './api';
import './App.css';

function App() {
  const [shouldWearCoat, setShouldWearCoat] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await checkCoat();
        setShouldWearCoat(data.shouldWearCoat);
      } catch (error) {
        console.error('Error fetching coat status', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Should you wear a coat today?</h1>
        {shouldWearCoat !== null ? (
          <p className="text-lg">{shouldWearCoat ? 'Yes, you should wear a coat!' : 'No, you don\'t need a coat!'}</p>
        ) : (
          <p className="text-lg">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default App;
