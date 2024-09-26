"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'

import { fetcherGET } from "../utils/fetcher";

const SelectListElement = ({ command, interval,text="",toggleTerminalOutput }: { command: string; interval: number;text?:string;toggleTerminalOutput: () => void }) => {
  const key = `/api/data/${command}`;
  const { data, error, isLoading } = useSWR(key, fetcherGET, { refreshInterval: interval});
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let obj;
  try {
    obj = JSON.parse(data);
  } catch (error) {
    return <div>{data}</div>
  }
  const provisionDevice = async (uuid: string) => {
    toggleTerminalOutput();
    try {
      await fetcher(`${uuid}`)(`/api/terminal/start`);
      console.log("sending " + uuid)
    } catch (error) {
      console.error("Failed to provision device:", error);
    }
  };

  const renderedElements = Object.entries(obj).map(([key, value], index) => (
    <div key={index} className="stats stats-vertical shadow w-full">
      <div className="join">
        <div className="stat">Name: {value['device-name']}</div>
        <div className="stat">Address: {value['mac-address']}</div>
        <div className="stat">UUID: {key}</div>
        <button onClick={() => provisionDevice(key)} className="btn-block btn-outline btn-success">Provision</button>
      </div>
    </div>
  ));
  
  return <div className='w-full'>{renderedElements}</div>;
  }

export default SelectListElement

