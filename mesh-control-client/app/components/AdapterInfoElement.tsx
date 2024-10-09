"use client"
import React from 'react'
import useSWR from 'swr';

import { fetcherGET } from '../utils/fetcher';

const AdapterInfoElement = ({isMobile}:{isMobile:boolean}) => {

  const request = `/controller?query=DEFAULT_DATA`;
  const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: 1 });

  if (error) return <div></div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

  let elementList = ["Name", "Alias", "Default-adapter", "Class", "Powered", "Discoverable", "Discovering", "Modalias"];
  let titleList = ["Name", "Alias", "MAC Address", "Bluetooth device class", "Power status", "Discoverable status", "Discovering status", "Modalias"]

  let returnData = data["DEFAULT_DATA"];

  return (
    <div className={isMobile == false ? 'bg-base-100 divide-base-200 divide-y join join-vertical m-2 mt-0' : 'bg-base-100 divide-base-200 divide-y join join-vertical rounded-none flex'}>
      <div className='join-item text-center mt-1 font-bold text-lg'>Bluetooth Adapter</div>
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
