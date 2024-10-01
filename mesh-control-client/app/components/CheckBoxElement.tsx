"use client"

import React, { useState } from 'react'
import { fetcherGET, fetcherPOST } from '../utils/fetcher'
import useSWR from 'swr';

const CheckBoxElement = ({apiUrl,query,postKey,text,interval = 2}: {apiUrl:string, query: string, postKey: string, text: string, interval?: number}) => {
    
    const customFetcher = (url: string) => fetcherGET(url, 3000);

    const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newToggleState = e.target.checked;
        ;
    
        try {
          const response = await fetcherPOST({ [postKey]: e.target.checked })(apiUrl,3000);
          setTimeout(function(){
            window.location.reload(); 
        }, 3000);
        } catch (err) {
          console.error('Error:', err);
        }
      };

    let request = apiUrl;
    if (query) {
            request += `?query=${query}`;
    }

    const { data, error, isLoading } = useSWR(request, customFetcher, { refreshInterval: interval});
    if (error) return <div></div>
    if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

    let state = data[query];

    return (
        <div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">{text}</span>
              <input 
                type="checkbox" 
                className="toggle" 
                id="backend-toggle" 
                checked={state} 
                onChange={handleToggleChange} 
              />
            </label>
          </div>
        </div>
      )
    }

export default CheckBoxElement