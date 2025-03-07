"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";

import { fetcherGET } from "../utils/fetcher";
import useIsDarkMode from "../helpers/isDarkMode";

const ReactIcon = ({
  iconOn,
  iconOff,
  enableBlink,
  apiUrl,
  query,
  interval,
}: {
  iconOn: string;
  iconOff: string;
  enableBlink: boolean;
  forceState?: boolean;
  apiUrl: string;
  query: string;
  interval: number;
}) => {
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

  const isDarkMode = useIsDarkMode()

  let request = `/${apiUrl}`;
  if (query) {
    request += `?query=${query}`;
  }
  const { data, error, isLoading } = useSWR(request, fetcherGET, {
    refreshInterval: interval,
  });
  if (error) return <div></div>;
  if (isLoading)
    return (
      <div>
        loading <span className="loading loading-spinner text-primary"></span>
      </div>
    );

  let state = data[query];

  const finalState = state && isBlinking ? blinkingState : state;

  return (
    <div className="min-w-[24px] min-h-[24px] flex items-center ">
      {finalState ? (
        <div>
          <Image
            src={iconOn}
            className="filter-invert-selected"
            width={24}
            height={24}
            alt={"ON"}
          />
        </div>
      ) : (
        <div>
          <Image
            src={iconOff}
            className={isDarkMode ? "filter-invert-dark" : "filter-invert-not-selected"}
            width={24}
            height={24}
            alt={"OFF"}
          />
        </div>
      )}
    </div>
  );
};

export default ReactIcon;
