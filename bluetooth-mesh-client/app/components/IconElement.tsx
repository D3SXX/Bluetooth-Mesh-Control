"use client"
import React, { ReactNode, useState } from 'react'
import useSWR from 'swr';
import ReactIcon from './ReactIcon';

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

const IconElement = ({ commandToggle,commandCheck,iconOn, iconOff, enableBlink }: { commandToggle: string,commandCheck: string,iconOn:string, iconOff: string, enableBlink: boolean }) => {
        const [forceState, setForceState] = useState(undefined);
        const key = `/api/data/${commandCheck}`;
        const { data, error, isLoading } = useSWR(key, fetcher(commandCheck), { refreshInterval: 0 });
        if (error) return <div>failed to load</div>
        if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

        const call = async (command: string) => {
                try {
                        let state = await fetcher(`${command}`)(`/api/data/${command}`) == "true";
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
