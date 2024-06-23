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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute w-auto min-w-full min-h-full max-w-none filter blur-md"
      >
        <source src={`${process.env.PUBLIC_URL}/bg-clouds.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative bg-white bg-opacity-70 p-10 rounded-lg shadow-lg text-center animate-fadeIn">
        <h1 className="text-4xl font-bold mb-4 text-black drop-shadow-lg">Should you wear a coat today?</h1>
        {shouldWearCoat !== null ? (
          <p className={`text-2xl text-black drop-shadow-lg ${shouldWearCoat ? 'text-green-500' : 'text-red-500'}`}>
            {shouldWearCoat ? 'Yes, you should wear a coat!' : 'No, you don\'t need a coat!'}
          </p>
        ) : (
          <p className="text-2xl text-gray-200 drop-shadow-lg">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default App;
