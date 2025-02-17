"use client"

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

import { fetcherGET, fetcherPOST } from "../utils/fetcher";
import { isEmpty } from '../utils/isEmpty';

interface SecurityObject {
    SECURITY_LEVEL: number;
}

const securityDescriptions = ["Low","Medium","High"]
  
const SecuritySlider = () => {
    const [returnData, setReturnData] = useState<number | null>(null);

    const changeValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        const data = await fetcherPOST({"security_level":newValue})('config')
        let jsonData: SecurityObject = data;
        (document.getElementById("steps-label") as HTMLFormElement).innerHTML = `Security level is set to ${jsonData.SECURITY_LEVEL} (${securityDescriptions[jsonData.SECURITY_LEVEL]})`
    };

    let request = `config?query=SECURITY_LEVEL`
    const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: 0 });
    
    useEffect(() => {
        if (data) {
            setReturnData(data["SECURITY_LEVEL"]);
        }
    }, [data]);

    useEffect(() => {
        if (returnData !== null) {
            document.getElementById("steps-range")?.setAttribute("value", returnData.toString());
        }
    }, [returnData]);
    
    if (error) return <div></div>
    if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
    
    return (
        <div>
            <div className={'bg-base-100 join join-vertical rounded-none md:rounded-xl block md:inline-block md:h-auto h-40'}>
                <div className='join-item text-center mt-1 font-bold border-base-200 border-b-2 text-lg'>Security Status</div>
                <div className='join-item'>
                    <label htmlFor="steps-range" id="steps-label" className="block mt-2 mb-2 mr-2 ml-2 text-sm font-medium text-center">
                        Security level is set to {returnData !== null ? `${returnData} (${securityDescriptions[returnData]})` : 'Unknown'}
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
                        defaultValue={returnData !== null ? returnData : 1}
                        className=" ml-2 mt-2 mr-2 w-3/4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
            </div>
        </div>
    );
}

export default SecuritySlider;
