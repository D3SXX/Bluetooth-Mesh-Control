"use client"
import React, { useEffect, useState } from 'react'

const useIsDarkMode = () => {

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
        setIsDarkMode(darkModeMediaQuery.matches);
    
        const handleChange = (event: { matches: boolean | ((prevState: boolean) => boolean); }) => {
          setIsDarkMode(event.matches);
        };
        darkModeMediaQuery.addEventListener('change', handleChange);
    
        return () => {
          darkModeMediaQuery.removeEventListener('change', handleChange);
        };
      }, []);

  return isDarkMode;
}

export default useIsDarkMode