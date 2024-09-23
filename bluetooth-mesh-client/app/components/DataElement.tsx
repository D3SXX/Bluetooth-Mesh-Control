"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'

const fetcher = () => async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
  const res = await fetch(apiUrl, {
    method: 'GET'
  });
  return res.text();
};


const DataElement = ({apiUrl, interval,query="",text="" }: { apiUrl: string; interval: number;text?:string,query?:string }) => {
  let request = `/${apiUrl}`
  if (query){
    request += `?query=${query}`
  }
  const { data, error, isLoading } = useSWR(request, fetcher(), { refreshInterval: interval});
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let returnData;
  try{
    const obj = JSON.parse(data)
    returnData = obj[query]
  }catch(e) {
    console.log(e)
    return <div>Failed to parse data</div>;
  }
  
  return <div>{returnData}</div>
};


export default DataElement

