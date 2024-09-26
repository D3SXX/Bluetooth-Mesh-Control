"use client"
import React, { useEffect, useState } from 'react';
import Toast from './Toast';

import { fetcherGET, fetcherPOST } from "../utils/fetcher";

const RegularButton = ({ apiUrl, requestData, text = "", style = "btn ml-2", timeout = undefined }: { apiUrl: string; requestData: object; text?: string, style: string, timeout?: number }) => {
  const [outputData, setOutputData] = useState<string | null>(null);
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState(0);

  const call = async () => {
    try {
      setOutputData(null);
      setIsCalled(true);
      const data = await fetcherPOST(requestData)(`${apiUrl}`);
      const jsonObj = JSON.parse(data);
      setOutputData(jsonObj["message"]);
      setIsCalled(false);
      setProgressValue(0); 
    } catch (error) {
      console.error('Error:', error);
      setOutputData('Failed to send a request to server');
      setIsCalled(false);
      setProgressValue(0);
    }
  };

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isCalled && timeout) {
      progressInterval = setInterval(() => {
        setProgressValue(prevValue => {
          const newValue = prevValue + 1;
          if (newValue >= timeout * 10) { 
            clearInterval(progressInterval);
            setIsCalled(false);
          }
          return newValue;
        });
      }, 100);
    }
    return () => clearInterval(progressInterval);
  }, [isCalled, timeout]);

  return (
    <div className='w-full'>
      <button onClick={call} className={style}>
        {text || ""}
      </button>
      {(isCalled && timeout) && (
          <progress className="progress progress-primary w-100" value={progressValue} max={timeout * 10}></progress>
      )}
      {outputData && (
        <Toast message={outputData} timeout={10000}></Toast>
      )}
    </div>
  )
}

export default RegularButton;
