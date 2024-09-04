"use client"
import React, { useEffect, useRef, useState } from 'react'
import useSWR from 'swr';

interface TerminalData{
    status: string;
    data: [];
}

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

const TerminalOutputElement = () => {
    const terminalOutputRef = useRef<HTMLUListElement>(null);
    const [terminalData, setTerminalData] = useState<TerminalData | null>(null);

    const key = `/api/data/get-provisioning-data`;
    const { data, error, isLoading } = useSWR(key, fetcher("get-provisioning-data"), { refreshInterval: 1000 });

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
                {(terminalData && terminalData["status"]) && <div className='items-center flex ml-auto'>Provisioning<span className="loading loading-spinner loading-md ml-2"></span></div>}
            </div>
            <div className="collapse-content">
                <ul className='overflow-auto h-64 bg-black rounded-lg' ref={terminalOutputRef}>
                    <div className='ml-2 mt-1'>
                        {terminalData && terminalData.data.map((line, index) => (
                            <li className="leading-tight text-lg text-white font-mono" key={index}>{line}</li>
                        ))}
                    </div>
                </ul>
            </div>
        </div>
    )
}

export default TerminalOutputElement;
