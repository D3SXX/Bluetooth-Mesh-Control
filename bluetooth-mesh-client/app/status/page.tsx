import React from 'react'
import NavBar from "@/app/components/NavBar";
import DataElement from "@/app/components/DataElement";
import ListElemenet from '../components/ListElement';
import RegularButton from '../components/RegularButton';
import { version } from 'os';

const StatusPage = () => {
  const titles = ["App version","Meshctl version","Default Adapter","Reset meshctl config"]
  const elements = [(<DataElement command="app-version" interval = {0}></DataElement>),(<DataElement command="meshctl-version" interval = {0}></DataElement>),(<ListElemenet command="list-adapters" interval = {0}></ListElemenet>),(<RegularButton command='reset-meshctl-config' text='Request'></RegularButton>)]
  const renderedElements = titles.map((title, index) => (
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-desc">{elements[index]}</div>
    </div>
  ));
  return (
    <div>
     <NavBar></NavBar>
     <div className="stats shadow mt-2 ml-2">
    {renderedElements}
  
</div>
    </div>
  )
}

export default StatusPage
