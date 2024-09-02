"use client"
import React, { useState, useEffect } from 'react';
import TerminalOutputElement from './TerminalOutputElement';

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

  const provision = async (uuid: string) => {
    setScanStatus(false)
    await fetcher(`${uuid}`)(`/api/data/provision-start`)
  }

  const reset_unprovisioned_list = async() => {
    setScanStatus(false)
    await fetcher(`true`)(`/api/data/reset_unprovisioned_list`)
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
      intervalId = setInterval(async () => {
        try {
          const data = await fetcher('true')('/api/data/unprovisioned-scan-status');
          let obj;
          try {
            obj = JSON.parse(data);
            setUnprovisionedNodes(obj["data"]);
            const state = obj["Status"] == "true";
            setScanStatus(state);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        } catch (error) {
          console.error('Error during scan:', error);
        }
      }, 750);
    

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
    <div className='join join-horizontal flex justify-between'>
      <div className='bg-white collapse collapse-open border-base-300 border  w-1/2 mr-2'>
        <div className="collapse-title text-xl font-medium flex items-center justify-between">
          <div className="flex items-center ml-2">
            <span>Toggle Scan</span>
            <input
              type="checkbox"
              className="toggle ml-2"
              checked={scanStatus}
              onChange={handleCheckboxChange}
              id="scan-toggle"
            />
          </div>
          <div className='ml-2 items-center flex'>
          {unprovisionedNodes.length > 0 && <div className='btn btn-ghost text-xl' onClick={reset_unprovisioned_list}>&#x2672;</div>}
          {scanStatus && <div className='items-center flex'>Scanning<span className="loading loading-spinner loading-md ml-2"></span></div>}
          </div>
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
                        <h3 className="font-bold text-lg">Provision</h3>
                        <div className="py-4 text-lg font-normal">
                          <div className='mb-2'>Do you want to provision this node?</div>
                          <div>
                        <form method="dialog" className="w-full flex justify-between"><button className="btn btn-error">Cancel</button>
                          <button className="btn btn-outline btn-success" onClick={() => provision(node.UUID)}>Provision {node.UUID}</button></form>
                          </div>
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
              <div className='text-gray-500'>Unprovisioned nodes list is empty.</div>
            )}
          </div>
        </div>
      </div>
      <div className='w-1/2'>
      <TerminalOutputElement></TerminalOutputElement>
      </div>
    </div>
  );
};

export default ProvisionElement;
