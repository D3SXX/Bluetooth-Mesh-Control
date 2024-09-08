import React from 'react'
import DataElement from "@/app/components/DataElement";
import "@/app/components/SideBar"
import SideBar from '@/app/components/SideBar';
import ActionButton from './ActionButton';
import Link from 'next/link';
import ReactIcon from './ReactIcon';
import IconElement from './IconElement';
import ErrorHandlerElement from './ErrorHandlerElement';

const NavBar = () => {
  const elements = [(<DataElement key="1" command="status" interval = {0}></DataElement>),(<DataElement key="2" command="default-adapter" interval = {0} text="Default Adapter: "></DataElement>)];
  const linksForElements = ["","/status"];
  return (
    

<div className="navbar bg-base-100">
  <div className="flex-none">
    <SideBar></SideBar>
  </div>
  <div className="flex-1">
  {
        elements.map((element, index) => <Link key={`${index}-link`} href={linksForElements[index]}><button className="btn btn-ghost text-xl">{element}</button></Link>)
      }
  </div>
  <div className="flex-none">
    <div><IconElement commandToggle="" commandCheck="discovery-status" iconOn='/icons/bluetooth.png' iconOff='/icons/bluetooth.png' enableBlink={true}></IconElement></div>
    <div><IconElement commandToggle="power-toggle" commandCheck="power-status" iconOn='/icons/power.png' iconOff='/icons/power.png' enableBlink={false}></IconElement></div>  
    <button className="btn btn-square btn-ghost">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
    </button>
  </div>
  <ErrorHandlerElement></ErrorHandlerElement>
</div>

  )
}

export default NavBar
