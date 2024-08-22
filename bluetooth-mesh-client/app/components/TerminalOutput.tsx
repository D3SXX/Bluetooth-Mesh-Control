"use client"
import { time } from 'console';
import React, { useEffect,useState, useRef } from 'react';
import useSWR from 'swr'
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


interface TerminalOutputProps {
  command: string;
  title?: string;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ command, title, }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [timeoutArr, setTimeoutArr] = useState<NodeJS.Timeout[]>([]);
  const terminalOutputRef = useRef<HTMLUListElement>(null);
  const collapseRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [processStarted, setProcessStarted] = useState<boolean>();
  const [toasts, setToasts] = useState<string[]>([]);
  useEffect(() => {
    let timeout = 1000;
    const fetchNewLine = async () => {
      try {
        
        const res = await fetch(`http://127.0.0.1:10000/api/terminal/get-newline`, {
          method: 'POST',
          body: command,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
        const newLine = await res.text();
        
        if (newLine === "<Empty>") {
          timeout = 1000; // Add check later for ongoing process
          
        }
        else if(newLine.includes("<Start")){
          setProcessStarted(true);
          const pattern = /<Start (\d+)>/;
          const match = newLine.match(pattern)

          setProgress(0);
          const refreshRate = 10;
          const timeout = parseInt(match[1]);
          const maxValue = 1000;
          const progressIncrement = (maxValue / timeout) * refreshRate; 
          const countdownInterval = setInterval(() => {
            setProgress(prevProgress => Math.min((prevProgress + progressIncrement), maxValue))
          }, refreshRate);
          setTimeout(() => {
            clearInterval(countdownInterval);
            setProgress(650);
          }, timeout);
        }
        else if(newLine.includes("<Toast>")){
          const pattern = /<Toast>(.*?)<\/Toast>/;
          const match: string = `${newLine.match(pattern)[1]}`
          setToasts(prevToasts => [...prevToasts, match]);
        }
        else if(newLine === "<Done>"){
          setProcessStarted(false);
          if (collapseRef.current) {
            collapseRef.current.classList.remove('collapse-open');
            setProgress(650);
            return;
          }
        } else {
          timeout = 1; // Adjust timeout if response is not empty
          const lines = await JSON.parse(newLine)
          try{
            for(let lineIndex in lines)
              setLines(prevLines => [...prevLines, lines[lineIndex]]);
          }
          catch{

          }

        }
        console.log(`Timeout for the next POST request: ${timeout}`)
      } catch (error) {
        console.error('Error fetching new line:', error);
        timeout = 1000; // Set timeout to retry after error
      } finally {
        const id = setTimeout(fetchNewLine, timeout);
        setTimeoutArr(prevState => [...prevState,id])
      }
    };

    fetchNewLine();
    return;
  }, [command]);

  useEffect(() => {
    while(timeoutArr.length > 2){
      clearTimeout(timeoutArr[0])
      timeoutArr.shift()
    }
  }, [timeoutArr]);

  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div tabIndex={0} className="collapse collapse-arrow bg-base-100" ref={collapseRef} >
      <input type="checkbox" defaultChecked /> 
      <div className="collapse-title text-xl font-medium">
        {title}
      </div>
      <progress className="progress progress-primary" value={progress} max="650"></progress>
      <div className="collapse-content">
        <ul className='overflow-auto h-64 bg-base-200 rounded-lg' ref={terminalOutputRef}>
          {lines.map((line, index) => (
            <li className="m-1" key={index}>{line}</li>
          ))}
        </ul>
      </div>
      {toasts.map((message, index) => (
        <Toast key={index} message={message} timeout="5000" />
      ))}
    </div>
  );
};

export default TerminalOutput;
