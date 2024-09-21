"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'

const fetcher = (request: string) => async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
  const res = await fetch(apiUrl, {
    method: 'POST', 
    body: request,
    headers: {
      'Content-Type': 'text/plain' 
    }
  });
  return res.text();
};


const DataElement = ({ command, interval,text="" }: { command: string; interval: number;text?:string }) => {
  const key = `/api/data/${command}`;
  const { data, error, isLoading } = useSWR(key, fetcher(command), { refreshInterval: interval});
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  return <div>{text}{data}</div>
};


export default DataElement

