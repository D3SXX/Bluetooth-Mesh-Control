"use client"

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

interface SecurityObject {
    Level: number;
    Description: string;
}

const securityDescriptions = ["Low","Medium","High"]

const fetcherGET = () => async (url: string) => {
    const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
    const res = await fetch(apiUrl, {
      method: 'GET', 
    });
    return res.text();
  };
  
  const fetcherPOST = (requestData: object) => async (url: string) => {
    const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
    console.log("fetcherPOST-")
    console.log(requestData)
    const res = await fetch(apiUrl, {
      method: 'POST', 
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json' 
      }
    });
    return res.text();
  };

const SecuritySlider = () => {

    const changeValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        console.log("sending POST - " + newValue)
        const data = await fetcherPOST({"security_level":newValue})('config')
        let jsonData: SecurityObject | undefined;
        try {
          jsonData = JSON.parse(data || '{}');
          console.log("Got data ")
          console.log(jsonData)
      } catch (err) {
          console.error('Error parsing data:', err);
      }
        document.getElementById("steps-label").innerHTML = `Security level is set to ${jsonData.SECURITY_LEVEL} (${securityDescriptions[jsonData.SECURITY_LEVEL]})`
    };

    let request = `config?query=SECURITY_LEVEL`
    const { data, error, isLoading } = useSWR(request, fetcherGET(), { refreshInterval: 0 });

    let returnData;

    useEffect(() => {
        if (returnData) {
            document.getElementById("steps-range")?.setAttribute("value",returnData.Level)
        }
    }, [returnData]);

    try{
      const obj = JSON.parse(data)
      returnData = obj["SECURITY_LEVEL"]
    }catch(e) {
      console.log(e)
      return <div>Failed to parse data</div>;
    }



    return (
        <div>
            <div className='bg-base-100 join join-vertical me-2'>
                <div className='join-item text-center mt-1 font-bold border-base-200 border-b-2 text-lg'>Security Status</div>
                <div className='join-item'>
                    <label htmlFor="steps-range" id="steps-label" className="block mt-2 mb-2 mr-2 ml-2 text-sm font-medium">
                        Security level is set to {returnData ? `${returnData} (${securityDescriptions[returnData]})` : 'Unknown'}
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
