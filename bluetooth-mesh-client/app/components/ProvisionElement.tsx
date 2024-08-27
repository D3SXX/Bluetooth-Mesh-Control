"use client"
import React, { useState, useEffect } from 'react';

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

const ProvisionElement = () => {
  const [scanStatus, setScanStatus] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (scanStatus) {
      intervalId = setInterval(async () => {
        try {
          await fetcher('true')('/api/data/unprovisioned-scan-status');
        } catch (error) {
          console.error('Error during scan:', error);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [scanStatus]);

  const handleCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setScanStatus(event.target.checked);
    try {
      await fetcher('true')('/api/data/unprovisioned-scan-toggle');
    } catch (error) {
      console.error('Error during scan:', error);
    }
  };

  return (
  <div>
    <div className='bg-white collapse collapse-open border-base-300 border'>
      <div className="collapse-title text-xl font-medium flex items-center justify-between">
        <div>
          Enable Scan 
          <input 
            type="checkbox" 
            className="toggle ml-2" 
            checked={scanStatus} 
            onChange={handleCheckboxChange} 
          />
        </div>
        {scanStatus && <span className="loading loading-spinner loading-md ml-auto"></span>}
      </div>
      <div className="collapse-content">
        {scanStatus && <div className='text-gray-500'>Scanning for unprovisioned nodes...</div>}
      </div>
    </div>
  </div>
  );
};

export default ProvisionElement;

