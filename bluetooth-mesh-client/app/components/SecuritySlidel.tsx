"use client"

import React, { useState } from 'react'
import useSWR from 'swr';

interface securityObject {
    "Level":number,
    "Description":string
}

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

const SecuritySlidel = () => {

    const [securityLevelValue, setSecurityLevelValue] = useState(0)

    const changeValue = (e) =>{
        console.log(e.target.value)
        setSecurityLevelValue(e.target.value)
    }

    const key = `/api/data/get-security`;
    const { data, error, isLoading } = useSWR(key, fetcher("get-security"), { refreshInterval: 0 });
    let jsonData : securityObject;
    try {
        
        jsonData = JSON.parse(data);
        //setSecurityLevelValue(jsonData.Level)        
    
    } catch (error) {
        
    }

    return (
    <div>
    <div className='bg-base-100 join join-vertical me-2'>
    <div className='join-item text-center mt-1 font-bold border-b-2 text-lg'>Security Status</div>
        <div className='join-item'>
            <label htmlFor="steps-range" className="block mt-2 mb-2 mr-2 ml-2 text-sm font-medium">Security level is set to {jsonData ? `${jsonData.Level} ${jsonData.Description}` : `Unknown`}</label>
        </div>
        <div className='join-item'>
        <input id="steps-range" type="range" onChange={changeValue} min={0} max={2} step={1} value={jsonData ? jsonData.Level : ''} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"></input>
        </div>
    </div>
    </div>
  )
}

export default SecuritySlidel