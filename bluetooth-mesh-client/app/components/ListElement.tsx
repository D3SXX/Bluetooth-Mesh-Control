"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'
import DataElement from './DataElement';
import { request } from 'http';

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


const ListElement = ({ command, interval,text="" }: { command: string; interval: number;text?:string }) => {
  const key = `/api/data/${command}`;
  const { data, error, isLoading } = useSWR(key, fetcher(command), { refreshInterval: interval});
  
  const [selectedValue, setSelectedValue] = useState("");

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedValue(event.target.value);
      const response = await fetcher(event.target.value)(`/api/data/set-${command}`);
      window.location.reload();
  };
  
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let obj = JSON.parse(data);
  const renderedElements = Object.entries(obj).map(([key, value], index) => (
        
          <option key={key} selected={value === "Default"}>{key}: {value}</option>
          
      ));

  return <div><select className="select select-bordered w-full max-w-xs" onChange={handleSelectChange}>{renderedElements}</select></div>
};


export default ListElement

