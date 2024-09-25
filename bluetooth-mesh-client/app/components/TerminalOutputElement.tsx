"use client"
import React, { useEffect, useRef, useState } from 'react'
import useSWR from 'swr';

interface TerminalData{
    PROVISION_ACTIVE: boolean;
    PROVISION_OUTPUT: [];
}

const fetcherGET = () => async (url: string) => {
    const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
    const res = await fetch(apiUrl, {
      method: 'GET', 
    });
    return res.text();
  };

const TerminalOutputElement = () => {
    const terminalOutputRef = useRef<HTMLUListElement>(null);
    const [terminalData, setTerminalData] = useState<TerminalData | null>(null);

    const request = "provision?query=PROVISION_OUTPUT&query=PROVISION_ACTIVE"
    const { data, error, isLoading } = useSWR(request, fetcherGET(), { refreshInterval: 1000 });

    
    useEffect(() => {
        if (data) {
            try {
                const obj = JSON.parse(data);
                setTerminalData(obj);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    }, [data]);

    useEffect(() => {
        if (terminalOutputRef.current) {
            terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
        }
    }, [terminalData]);

    if (error) return <div>Failed to load</div>;
    if (isLoading) return <div>Loading <span className="loading loading-spinner text-primary"></span></div>;

    return (
        <div tabIndex={0} className="collapse collapse-arrow bg-base-100">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl font-medium inline-flex">
                <div>Terminal Output</div>
                {(terminalData && terminalData["PROVISION_ACTIVE"]) && <div className='items-center flex ml-auto'>Provisioning<span className="loading loading-spinner loading-md ml-2"></span></div>}
            </div>
            <div className="collapse-content">
                <ul className='overflow-auto h-64 bg-black rounded-lg' ref={terminalOutputRef}>
                    <div className='ml-2 mt-1'>
                        {terminalData != undefined && terminalData["PROVISION_OUTPUT"] != undefined && terminalData["PROVISION_OUTPUT"].map((line, index) => (
                            <li className="leading-tight text-lg text-white font-mono" key={index}>{line}</li>
                        ))}
                    </div>
                </ul>
            </div>
        </div>
    )
}

export default TerminalOutputElement;
