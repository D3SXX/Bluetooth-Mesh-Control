"use client"
import React, { useState } from 'react';
import useSWR from 'swr'
import DataElement from './DataElement'
import { comma } from 'postcss/lib/list';
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

const RegularButton = ({ command,requestData=command, text="" }: { command: string;requestData?:string; text?:string }) => {
        const [outputData, setOutputData] = useState<string | null>(null);

        const call = async (command: string,requestData:string) => {
                try {
                  const data = await fetcher(`${requestData}`)(`/api/data/${command}`);
                  setOutputData(data);
                } catch (error) {
                  console.error('Error:', error);
                  setOutputData('Failed to send a request to server');
                }
              };

        return (
<div>
      <button onClick={()=>call(command,requestData)} className="btn ml-2">{text || ""}</button>
      {outputData && (
        <Toast message={outputData} timeout={10000}></Toast>
      )}
    </div>
  )
}

export default RegularButton
