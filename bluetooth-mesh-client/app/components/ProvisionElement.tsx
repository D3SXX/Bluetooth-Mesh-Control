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

interface UnprovisionedNode {
  OOB: string;
  UUID: string;
  address: string;
  name: string;
}

const ProvisionElement = () => {
  const [scanStatus, setScanStatus] = useState(false);
  const [unprovisionedNodes, setUnprovisionedNodes] = useState<UnprovisionedNode[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (scanStatus) {
      intervalId = setInterval(async () => {
        try {
          const data = await fetcher('true')('/api/data/unprovisioned-scan-status');
          let obj;
          try {
            obj = JSON.parse(data);
            setUnprovisionedNodes(obj);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
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
      await fetcher(`${event.target.checked}`)('/api/data/unprovisioned-scan-toggle');
    } catch (error) {
      console.error('Error during scan toggle:', error);
    }
  };

  return (
    <div>
      <div className='bg-white collapse collapse-open border-base-300 border'>
        <div className="collapse-title text-xl font-medium flex items-center justify-between">
          <div className="flex items-center">
            <span>Enable Scan</span>
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
          {scanStatus && unprovisionedNodes.length <= 0 && <div className='text-gray-500'>Scanning for unprovisioned nodes...</div>}
          <div className="mt-4">
            {unprovisionedNodes.length > 0 ? (
              <div>
                {unprovisionedNodes.map((node, index) => (
                  <div key={index} onClick={() => document.getElementById(`modal-${index}`).showModal()} className="btn h-fit btn-ghost stats shadow w-full mb-1 mt-1">
                    <div className="join join-horizontal flex items-center">
                      <div className="stat join-item ">Name: {node.name}</div>
                      <div className="stat join-item">Address: {node.address}</div>
                      <div className="stat join-item">UUID: {node.UUID}</div>
                      <div className="stat join-item">OOB: {node.OOB}</div>
                    </div>
                    <dialog id={`modal-${index}`} className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">Do you want to provision this node?</h3>
                        <div className="py-4 flex items-center justify-center space-x-4">
                        <form method="dialog"><button className="btn btn-error">Cancel</button></form>
                          <div className="btn btn-outline btn-success">Provision {node.UUID}</div>
                        </div>
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-gray-500'>No unprovisioned nodes found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionElement;
