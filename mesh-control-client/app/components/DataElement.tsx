"use client"

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr'
import React from 'react'
import Image from 'next/image'

import { fetcherGET } from '../utils/fetcher';

const DataElement = ({apiUrl, interval,query="",text="", style="", image="" }: { apiUrl: string; interval: number;text?:string,query?:string, style?:string, image?:string }) => {
  let request = `/${apiUrl}`
  if (query){
    request += `?query=${query}`
  }
  const { data, error, isLoading } = useSWR(request, fetcherGET, { refreshInterval: interval});
  if (error) return <div>{text}</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>

  let returnData = data[query];

  return <div className={style + " inline-flex items-center"}>{image && <Image src={image} width={35} height={35} alt={text}></Image>} {returnData}</div>
};


export default DataElement

