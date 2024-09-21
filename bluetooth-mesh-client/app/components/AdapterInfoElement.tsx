"use client"
import React from 'react'
import useSWR from 'swr';

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

const AdapterInfoElement = () => {

  const key = `/api/data/adapter-info`;
  const { data, error, isLoading } = useSWR(key, fetcher("adapter-info"), { refreshInterval: 1 });

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

  let elementList = ["Name", "Alias", "Default-adapter", "Class", "Powered", "Discoverable", "Discovering", "Modalias"];
  let titleList = ["Name", "Alias", "MAC Address", "Bluetooth device class", "Power status", "Discoverable status", "Discovering status", "Modalias"]

  let obj = JSON.parse(data);

  console.log(obj)

  return (
    <div className='bg-base-100 divide-base-200 divide-y join join-vertical me-2 mb-2'>
      <div className='join-item text-center mt-1 font-bold text-lg'>Bluetooth Adapter</div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
          </thead>
          <tbody>

            {elementList.map((key, index) => <tr className='hover'><td>
              {titleList[index]}
            </td>
              <td>
                {obj[key]}
              </td>
            </tr>)}

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdapterInfoElement
