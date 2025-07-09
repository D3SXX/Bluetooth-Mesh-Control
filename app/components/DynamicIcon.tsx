import React, { useEffect, useState } from 'react'
import useIsDarkMode from '../helpers/isDarkMode';
import useSWR, { mutate } from 'swr';
import { fetcherGET, fetcherPOST } from '../utils/fetcher';
import Image from 'next/image';
import IconButton from '@mui/material/IconButton';
const DynamicIcon = ({iconOn, iconOff, enableBlink, apiUrl, query, interval}: {iconOn: React.JSX.Element, iconOff: React.JSX.Element, enableBlink: boolean, apiUrl: string, query: string, interval: number}) => {

    const [blinkingState, setBlinkingState] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [iconState, setIconState] = useState(false);
    const isDarkMode = useIsDarkMode()
    
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


    let request = `/${apiUrl}`;
    if (query) {
        request += `?query=${query}`;
    }

    const { data, error, isLoading } = useSWR(request, fetcherGET, {
        refreshInterval: interval,
    });


    useEffect(() => {
      if(data) {
        setIconState(data[query]);
      }
  }, [data, query]);

    if (error) return <div></div>;
    if (isLoading)
      return (
        <div>
          loading <span className="loading loading-spinner text-primary"></span>
        </div>
      );

    const changeState = async () => {
        const response = await fetcherPOST({[query.toLowerCase()]: !data[query]})(`/${apiUrl}`);
        setIconState(response[query]);
    }


      let state = iconState;

      const finalState = state && isBlinking ? blinkingState : state;

  return (
    <IconButton onClick={changeState}>
        {finalState ? (
            iconOn
        ) : (
            iconOff
        )}
    </IconButton>
  )
}

export default DynamicIcon