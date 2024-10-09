"use client"
import React from 'react'
import DataElement from './DataElement'
import ListElement from './ListElement'
import RegularButton from './RegularButton'
import AdapterInfoElement from './AdapterInfoElement'
import SecuritySlider from './SecuritySlider'

import useIsMobile from './isMobile'

const StatusDataElements = () => {

    const isMobile = useIsMobile();

    const titles = ["App version","Meshctl version","Default Adapter","Reset meshctl config"]
    const elements = [(<DataElement key="element_1" apiUrl="server" query='VERSION' interval = {0}></DataElement>),(<DataElement key="element_2" apiUrl="server" query='MESHCTL' interval = {0}></DataElement>),(<ListElement key="element_3" apiUrl='controller' query='LIST' postKey="address" interval = {2}></ListElement>),(<RegularButton key="element_4" apiUrl='config?config=PROV_DB, LOCAL_NODE' query='NODES' text='Request' style='border border-base-300 btn w-full' uniqueId='element_4'></RegularButton>)]

  return (
    <div>
    <div className={isMobile == false ? 'stats shadow m-2' : 'stats stats-vertical w-full rounded-none'}>
        {(titles.map((title, index) => (
        <div className="stat" key={`renderedElement-${index}`}>
          <div className="stat-title font-bold text-base-content">{title}</div>
          <div className="stat-desc text-base-content">{elements[index]}</div>
        </div>)))}
        </div>
        <div className={isMobile == false ? 'flex' : ''}>
        <AdapterInfoElement isMobile={isMobile}></AdapterInfoElement>
        <SecuritySlider isMobile={isMobile}></SecuritySlider>
        </div>
        </div>
  )
}


export default StatusDataElements