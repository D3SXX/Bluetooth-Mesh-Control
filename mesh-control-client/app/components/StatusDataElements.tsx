"use client"
import React from 'react'
import DataElement from './DataElement'
import ListElement from './ListElement'
import RegularButton from './RegularButton'
import AdapterInfoElement from './AdapterInfoElement'
import SecuritySlider from './SecuritySlider'


const StatusDataElements = () => {

    const titles = ["App version","Meshctl version","Default Adapter","Reset meshctl config"]
    const elements = [(<DataElement key="element_1" apiUrl="server" query='VERSION' interval = {0}></DataElement>),(<DataElement key="element_2" apiUrl="server" query='MESHCTL' interval = {0}></DataElement>),(<ListElement key="element_3" apiUrl='controller' query='LIST' postKey="address" interval = {2}></ListElement>),(<RegularButton key="element_4" apiUrl='config?config=PROV_DB, LOCAL_NODE' query='NODES' text='Request' style='border border-base-300 btn w-full' uniqueId='element_4'></RegularButton>)]

  return (
    <div>
    <div className={'stats stats-vertical md:stats-horizontal md:shadow md:m-2 rounded-none md:rounded-xl block md:inline-grid'}>
        {(titles.map((title, index) => (
        <div className="stat" key={`renderedElement-${index}`}>
          <div className="stat-title font-bold text-base-content">{title}</div>
          <div className="stat-desc text-base-content">{elements[index]}</div>
        </div>)))}
        </div>
        <div className="block md:flex">
        <AdapterInfoElement></AdapterInfoElement>
        <SecuritySlider></SecuritySlider>
        </div>
        </div>
  )
}


export default StatusDataElements