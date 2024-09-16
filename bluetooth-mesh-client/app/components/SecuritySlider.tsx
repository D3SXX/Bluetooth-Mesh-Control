"use client"

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

interface SecurityObject {
    Level: number;
    Description: string;
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

const SecuritySlider = () => {

    const changeValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        const data = await fetcher(JSON.stringify({"Value":newValue}))('/api/data/set-security')
        let jsonData: SecurityObject | undefined;
        try {
          jsonData = JSON.parse(data || '{}');
      } catch (err) {
          console.error('Error parsing data:', err);
      }
        document.getElementById("steps-label").innerHTML = `Security level is set to ${jsonData.Level} (${jsonData.Description})`
    };

    const key = `/api/data/get-security`;
    const { data, error, isLoading } = useSWR(key, fetcher("get-security"), { refreshInterval: 0 });

    let jsonData: SecurityObject | undefined;
    try {
        jsonData = JSON.parse(data || '{}');
    } catch (err) {
        console.error('Error parsing data:', err);
    }

    useEffect(() => {
        if (jsonData) {
            document.getElementById("steps-range")?.setAttribute("value",jsonData.Level)
        }
    }, [jsonData]);

    return (
        <div>
            <div className='bg-base-100 join join-vertical me-2'>
                <div className='join-item text-center mt-1 font-bold border-b-2 text-lg'>Security Status</div>
                <div className='join-item'>
                    <label htmlFor="steps-range" id="steps-label" className="block mt-2 mb-2 mr-2 ml-2 text-sm font-medium">
                        Security level is set to {jsonData ? `${jsonData.Level} (${jsonData.Description})` : 'Unknown'}
                    </label>
                </div>
                <div className='join-item flex justify-center items-center mb-4'>
                    <input
                        id="steps-range"
                        type="range"
                        onChange={changeValue}
                        min={0}
                        max={2}
                        step={1}
                        className=" ml-2 mt-2 mr-2 w-3/4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
            </div>
        </div>
    );
}

export default SecuritySlider;
