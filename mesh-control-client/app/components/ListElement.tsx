"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'
import DataElement from './DataElement';
import { request } from 'http';

import { fetcherGET, fetcherPOST } from "../utils/fetcher";


const ListElement = ({ apiUrl, interval, postKey, query="", text="" }: { apiUrl: string; interval: number; postKey: string, text?:string, query?:string }) => {
  let request = `/${apiUrl}`
  if (query){
    request += `?query=${query}`
  }
  
  const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: interval});
  
  const [selectedValue, setSelectedValue] = useState("");

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedValue(event.target.value);
      const response = await fetcherPOST({[postKey]: event.target.value})(apiUrl);
      returnData = response[query]
  };
  
  if (error) return <div></div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let returnData = data[query];

  const renderedElements = Object.entries(returnData).map(([key, value]) => (
          <option key={key} value={key} selected={(value as string).includes("[default]")} disabled={(value as string).includes("[default]")}>{key} ({(value as string)})</option>
      ));

  return <div><select className="select select-bordered w-full max-w-xs" onChange={handleSelectChange}>{renderedElements}</select></div>
};


export default ListElement

