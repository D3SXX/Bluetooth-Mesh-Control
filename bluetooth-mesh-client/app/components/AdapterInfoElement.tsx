"use client"
import React from 'react'
import useSWR from 'swr';

const fetcher = () => async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000${url}`;
  const res = await fetch(apiUrl, {
    method: 'GET',
  });
  return res.text();
};

const AdapterInfoElement = () => {

  const request = `/controller?query=DEFAULT_DATA`;
  const { data, error, isLoading } = useSWR(request, fetcher(), { refreshInterval: 1 });

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

  let elementList = ["Name", "Alias", "Default-adapter", "Class", "Powered", "Discoverable", "Discovering", "Modalias"];
  let titleList = ["Name", "Alias", "MAC Address", "Bluetooth device class", "Power status", "Discoverable status", "Discovering status", "Modalias"]

  let returnData;
  try{
    const obj = JSON.parse(data)
    returnData = obj["DEFAULT_DATA"]
    console.log(returnData)
  }catch(e) {
    console.log(e)
    return <div>Failed to parse data</div>;
  }

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
                {returnData[key]}
              </td>
            </tr>)}

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdapterInfoElement
