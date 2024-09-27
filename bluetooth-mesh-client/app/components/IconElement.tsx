"use client"
import React, { ReactNode, useState } from 'react'
import useSWR from 'swr';
import ReactIcon from './ReactIcon';

import { fetcherGET, fetcherPOST } from "../utils/fetcher";
      

const IconElement = ({apiUrl, query, postKey,iconOn, iconOff, enableBlink }: { apiUrl: string, query: string, postKey:string, iconOn:string, iconOff: string, enableBlink: boolean }) => {
        const [forceState, setForceState] = useState(undefined);

        let request = apiUrl
        if (query){
          request += `?query=${query}`
        }        

        const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: 0 });
        if (error) return <div>failed to load</div>
        if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

        let returnData = data[query];    
        
        const call = async () => {
                try {
                        let state = await fetcherPOST({[postKey]: "any"})(apiUrl)
                        try{
                                const objState = JSON.parse(state)
                                state = objState[query]
                              }catch(e) {
                                console.log(e)
                                return <div>Failed to parse data</div>;
                              }   
                        setForceState(state)
                        console.log(`Forcing icon button to ${state}`)
                } catch (error) {
                        console.error('Error:', error);
                }
        };

        return (
                <div>
                        <button className='btn btn-ghost' onClick={() => call()}>
                                <div>
                                        <ReactIcon iconOn={iconOn} iconOff={iconOff} enableBlink={enableBlink} apiUrl={apiUrl} query={query} interval={1}>
                                        </ReactIcon>
                                </div>
                        </button>
                </div>
        )
}

export default IconElement
