"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'
import DataElement from './DataElement';
import { request } from 'http';

const fetcherGET = () => async (url: string) => {
  console.log("fetcherget() - " + url)
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
  const res = await fetch(apiUrl, {
    method: 'GET', 
  });
  return res.text();
};

const fetcherPOST = (requestData: object) => async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
  const res = await fetch(apiUrl, {
    method: 'POST', 
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json' 
    }
  });
  return res.text();
};


const ListElement = ({ apiUrl, interval, postKey, query="", text="" }: { apiUrl: string; interval: number; postKey: string, text?:string, query?:string }) => {
  let request = `/${apiUrl}`
  if (query){
    request += `?query=${query}`
  }
  
  const { data, error, isLoading } = useSWR(request, fetcherGET(), { refreshInterval: interval});
  
  const [selectedValue, setSelectedValue] = useState("");

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedValue(event.target.value);
      const response = await fetcherPOST({postKey: event.target.value})(apiUrl);
  };
  
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let obj;
  try {
    obj = JSON.parse(data);
  } catch {
    return <div>Failed to parse data</div>;
  }
  const renderedElements = Object.entries(obj).map(([key, value], index) => (
        
          <option key={key} selected={value === "Default"}>{key}: {value}</option>
          
      ));

  return <div><select className="select select-bordered w-full max-w-xs" onChange={handleSelectChange}>{renderedElements}</select></div>
};


export default ListElement

