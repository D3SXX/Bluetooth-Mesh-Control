"use client"
import React, { ReactNode, useState } from 'react'
import useSWR from 'swr';
import ReactIcon from './ReactIcon';

const fetcherGET = () => async (url: string) => {
        const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
        const res = await fetch(apiUrl, {
          method: 'GET', 
        });
        return res.text();
      };
      
      const fetcherPOST = (requestData: object) => async (url: string) => {
        const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
        const res = await fetch(apiUrl, {
          method: 'POST', 
          body: JSON.stringify(requestData),
          headers: {
            'Content-Type': 'application/json' 
          }
        });
        return res.text();
      };

const IconElement = ({apiUrl, query, postKey,iconOn, iconOff, enableBlink }: { apiUrl: string, query: string, postKey:string, iconOn:string, iconOff: string, enableBlink: boolean }) => {
        const [forceState, setForceState] = useState(undefined);

        let request = apiUrl
        if (query){
          request += `?query=${query}`
        }        

        const { data, error, isLoading } = useSWR(request, fetcherGET(), { refreshInterval: 0 });
        if (error) return <div>failed to load</div>
        if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

        let returnData : boolean;
        try{
          const obj = JSON.parse(data)
          returnData = obj[query]
        }catch(e) {
          console.log(e)
          return <div>Failed to parse data</div>;
        }        

        const call = async (command: string) => {
                try {
                        let state = await fetcherPOST({postKey: !returnData})(apiUrl)
                        try{
                                const objState = JSON.parse(state)
                                state = objState[postKey]
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
                        <button className='btn btn-ghost' onClick={() => call(commandToggle)}>
                                <div>
                                        <ReactIcon iconOn={iconOn} iconOff={iconOff} enableBlink={enableBlink} command={commandCheck} interval={1}>
                                        </ReactIcon>
                                </div>
                        </button>
                </div>
        )
}

export default IconElement
