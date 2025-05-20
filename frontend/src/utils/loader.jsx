import React from 'react';
import Lottie from 'lottie-react';
import animationData from './Animation - 1747772465349.json'; // place JSON in src/

const CoolLoader = ({ height = 200 }) => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <Lottie animationData={animationData} loop={true} style={{ height }} />
    </div>
  );
};

export default CoolLoader;
