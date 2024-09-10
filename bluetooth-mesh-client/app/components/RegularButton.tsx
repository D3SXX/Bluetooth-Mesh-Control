"use client"
import React, { useEffect, useState } from 'react';
import Toast from './Toast';

const fetcher = (request: string) => async (url: string) => {
  const apiUrl = `http://127.0.0.1:10000${url}`;
  const res = await fetch(apiUrl, {
    method: 'POST',
    body: request,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
  return res.text();
};

const RegularButton = ({ command, requestData = command, text = "", style = "btn ml-2", timeout = undefined }: { command: string; requestData?: string; text?: string, style: string, timeout?: number }) => {
  const [outputData, setOutputData] = useState<string | null>(null);
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState(0);

  const call = async (command: string, requestData: string) => {
    try {
      setOutputData(null);
      setIsCalled(true);
      const data = await fetcher(`${requestData}`)(`/api/data/${command}`);
      setOutputData(data);
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
    <div>
      <button onClick={() => call(command, requestData)} className={style}>
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
