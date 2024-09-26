"use client"
import React, { useState, useEffect } from 'react';
import DataElement from './DataElement';
import SelectListElement from './SelectListElement';

const ActionButton = ({text, actionText, command, interval, enableProgressBar = false,toggleTerminalOutput }: { text:string,actionText:string; command: string; interval: number; enableProgressBar?:boolean;toggleTerminalOutput: () => void}) => {
        const [isButtonStart, setButtonStart] = useState(false);
        const [progressValue, setProgressValue] = useState(0);
        
        useEffect(() => {
          let progressInterval: NodeJS.Timeout;
          
          if (enableProgressBar && isButtonStart) {
              progressInterval = setInterval(() => {
                  setProgressValue(prevValue => {
                      const newValue = prevValue + 10 / (10000 / 1000);
                      return newValue >= 650 ? 0 : newValue;
                  });
              }, 10);
          }
  
          return () => {
              clearInterval(progressInterval);
          };
      }, [enableProgressBar, isButtonStart, interval]);
        const startButton = () => {
          setButtonStart(true);
        };
        const stopButton = () => {
          setButtonStart(false);
          setProgressValue(0);
        };
        return (
    <div>
        <div className="stats shadow w-full">
  
  <div className="stat" >
    <div className='join'>
  <button onClick={startButton} className="btn-block join-item">{isButtonStart && (<div className="flex items-center text-xl" >{actionText}<div className='ml-2 mt-2'> <span className="loading loading-infinity loading-md"></span></div></div>)} {!isButtonStart && (text)}</button>
  {isButtonStart && (<div><button onClick={stopButton} className="btn join-item btn-error">Stop</button></div>
  )}
  </div>
  {isButtonStart && (
          <div>
            <progress className="progress progress-primary w-100" value={progressValue} max="650"></progress>
                <SelectListElement toggleTerminalOutput={toggleTerminalOutput} command={command} interval = {interval}></SelectListElement>
          </div>
        )}
    
   
  </div>
  
</div>
      
        
    </div>
  )
}

export default ActionButton
