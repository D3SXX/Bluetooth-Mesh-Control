"use client"

import React from 'react'
import useSWR from 'swr';
import Image from 'next/image'

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

const imageOn = {
  filter: "invert(39%) sepia(93%) saturate(3269%) hue-rotate(193deg) brightness(98%) contrast(110%)",
}

const imageOff = {
  filter: " invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%)",
}

const ReactIcon = ({iconOn,iconOff,enableBlink,forceState, command, interval}: { iconOn:string,iconOff:string,enableBlink:boolean,forceState?: boolean, command:string, interval:number}) => {
        const key = `/api/data/${command}`;
        const { data, error, isLoading } = useSWR(key, fetcher(command), { refreshInterval: interval});
        if (error) return <div>failed to load</div>
        if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
        let state = (data == "true")
        state = forceState ? forceState : state;  

  return (
    <div>
      {state && <div><Image src={iconOn} style={imageOn} width={26} height={26} alt={'ON'}/></div>}
      {!state && <div><Image src={iconOff} style={imageOff} width={26} height={26} alt={'OFF'}/></div>}
    </div>
  )
}

export default ReactIcon
