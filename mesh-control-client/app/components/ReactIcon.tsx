"use client"

import React, { useEffect, useState } from 'react'
import useSWR from 'swr';
import Image from 'next/image'

import { fetcherGET } from "../utils/fetcher";

const imageOn = {
  filter: "invert(39%) sepia(93%) saturate(3269%) hue-rotate(193deg) brightness(98%) contrast(110%)",
}

const imageOff = {
  filter: " invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%)",
}

const ReactIcon = ({iconOn,iconOff,enableBlink, apiUrl, query, interval}: { iconOn:string,iconOff:string,enableBlink:boolean,forceState?: boolean, apiUrl:string, query:string, interval:number}) => {
  const [blinkingState, setBlinkingState] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    if (enableBlink) {
      const blinkInterval = setInterval(() => {
        setBlinkingState((prevState) => !prevState);
      }, 750);
      setIsBlinking(true);
      return () => clearInterval(blinkInterval);
    } else {
      setIsBlinking(false);
      setBlinkingState(false);
    }
  }, [enableBlink]);
  
  
        let request = `/${apiUrl}`
        if (query){
          request += `?query=${query}`
        }
        const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: interval});
        if (error) return <div></div>
        if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
 
        let state = data[query];

        const finalState = state && isBlinking ? blinkingState : state;
        
        return (
          <div>
            {finalState ? (
              <div>
                <Image src={iconOn} style={imageOn} width={26} height={26} alt={'ON'} />
              </div>
            ) : (
              <div>
                <Image src={iconOff} style={imageOff} width={26} height={26} alt={'OFF'} />
              </div>
            )}
          </div>
        );
      };

export default ReactIcon
