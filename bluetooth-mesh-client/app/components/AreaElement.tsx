"use client"
import React, { ReactNode, useState } from 'react'
import useSWR from 'swr';
import ReactIcon from './ReactIcon';

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

const AreaElement = ({ commandToggle,commandCheck,iconOn, iconOff, enableBlink }: { commandToggle: string,commandCheck: string,iconOn:string, iconOff: string, enableBlink: boolean }) => {
        const [forceState, setForceState] = useState(Boolean);
        const key = `/api/data/${commandCheck}`;
        const { data, error, isLoading } = useSWR(key, fetcher(commandCheck), { refreshInterval: 0 });
        if (error) return <div>failed to load</div>
        if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

        const call = async (command: string) => {
                try {
                        let state = await fetcher(`${command}`)(`/api/data/${command}`);
                        setForceState(state == "true")
                        console.log(`Forcing power icon to ${state=="true"}`)
                } catch (error) {
                        console.error('Error:', error);
                }
        };

        return (
                <div>
                        <button className='btn btn-ghost' onClick={() => call(commandToggle)}>
                                <div>
                                        <ReactIcon iconOn={iconOn} iconOff={iconOff} forceState={forceState} enableBlink={false} command={commandCheck} interval={0}>
                                        </ReactIcon>
                                </div>
                        </button>
                </div>
        )
}

export default AreaElement
