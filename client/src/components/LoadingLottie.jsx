import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/loadingScene.json'

const LoadingLottie = ({ style = { height: 120, width: 120 } }) => (
  <div className="flex justify-center items-center h-32">
    <Lottie animationData={animationData} loop={true} style={style} />
  </div>
);

export default LoadingLottie;
