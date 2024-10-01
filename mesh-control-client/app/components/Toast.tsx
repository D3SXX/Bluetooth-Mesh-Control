"use client"

import React, { useState, useEffect } from 'react';

const Toast = ({ message, timeout }: {message:string, timeout: number}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(90); // Initial progress value (100%)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, timeout);

    // Calculate progress decrement interval
    const decrementInterval = timeout / 100;

    // Decrease progress by 1% every decrement interval
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => Math.max(prevProgress - 1, 0));
    }, decrementInterval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [timeout]);

  return (
    <>
      {visible && (
        <div className="toast toast-bottom toast-end">
          <div className="alert alert-info">
            <div><span>{message}</span></div>
            <progress className="progress progress-primary" value={progress} max="90"></progress>
          </div>
          
        </div>
      )}
    </>
  );
};

export default Toast;
