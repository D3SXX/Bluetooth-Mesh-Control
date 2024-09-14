import React from 'react'
import NavBar from "@/app/components/NavBar";
import DataElement from "@/app/components/DataElement";
import ListElemenet from '../components/ListElement';
import RegularButton from '../components/RegularButton';
import { version } from 'os';
import AdapterInfoElement from '../components/AdapterInfoElement';

const StatusPage = () => {
  const titles = ["App version","Meshctl version","Default Adapter","Reset meshctl config"]
  const elements = [(<DataElement key="element_1" command="app-version" interval = {0}></DataElement>),(<DataElement key="element_2" command="meshctl-version" interval = {0}></DataElement>),(<ListElemenet key="element_3" command="list-adapters" interval = {0}></ListElemenet>),(<RegularButton key="element_4" command='reset-meshctl-config' text='Request' style='border border-base-300 btn w-full'></RegularButton>)]
  const renderedElements = titles.map((title, index) => (
    <div className="stat" key={"renderedElement-" + {index}}>
      <div className="stat-title font-bold ">{title}</div>
      <div className="stat-desc">{elements[index]}</div>
    </div>
  ));
  return (
    <div>
     <NavBar></NavBar>
     <div className="stats shadow mt-2 ml-2">
    {renderedElements}
  
    </div><br></br>
    <div className='mt-2 ml-2'>
<AdapterInfoElement></AdapterInfoElement>
</div>
    </div>
  )
}

export default StatusPage
