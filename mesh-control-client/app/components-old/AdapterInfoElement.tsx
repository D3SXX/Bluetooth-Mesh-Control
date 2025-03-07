"use client"
import React from 'react'
import useSWR from 'swr';

import { fetcherGET } from '../utils/fetcher';

const AdapterInfoElement = () => {

  const request = `/controller?query=DEFAULT_DATA`;
  const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: 1 });

  if (error) return <div></div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

  let elementList = ["Name", "Alias", "Default-adapter", "Class", "Powered", "Discoverable", "Discovering", "Modalias"];
  let titleList = ["Name", "Alias", "MAC Address", "Bluetooth device class", "Power status", "Discoverable status", "Discovering status", "Modalias"]

  let returnData = data["DEFAULT_DATA"];

  return (
    <div className={'bg-base-100 divide-base-200 divide-y join join-vertical md:m-2 md:mt-0 block md:inline-block rounded-none md:rounded-xl'}>
      <div className='join-item text-center md:mt-1 font-bold text-lg'>Bluetooth Adapter</div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
          </thead>
          <tbody>

            {elementList.map((key, index) => <tr key={key} className='hover'><td>
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
