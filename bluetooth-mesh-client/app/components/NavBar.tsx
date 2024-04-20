import React from 'react'
import DataElement from "@/app/components/DataElement";
import "@/app/components/SideBar"
import SideBar from '@/app/components/SideBar';
import ActionButton from './ActionButton';

const NavBar = () => {
  const elements = [(<DataElement command="status" interval = {0}></DataElement>),(<DataElement command="default-adapter" interval = {0} text="Default Adapter: "></DataElement>)];
  return (
    

<div className="navbar bg-base-100">
  <div className="flex-none">
    <SideBar></SideBar>
  </div>
  <div className="flex-1">
  {
        elements.map(element => <a className="btn btn-ghost text-xl">{element}</a>)
      }
  </div>
  <div className="flex-none">
    <button className="btn btn-square btn-ghost">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
    </button>
  </div>
</div>

  )
}

export default NavBar
