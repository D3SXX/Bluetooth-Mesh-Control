"use client"
import React from 'react';
import DataElement from "@/app/components/DataElement";
import SideBar from '@/app/components/SideBar';
import Link from 'next/link';
import IconElement from './IconElement';
import ErrorHandlerElement from './ErrorHandlerElement';
import CheckBoxElement from './CheckBoxElement';
import BottomNavBar from './BottomNavBar';

const NavBar = () => {
  const elements = [
    (<DataElement key="1" apiUrl='server' query='NAME' interval={0} text='MeshControl' style='text-[#0082fc]' />),
    (<DataElement key="2" apiUrl='controller' query='DEFAULT' interval={2} text="(Server is offline)" />)
  ];
  
  const linksForElements = ["/", "/status"];

  return (
    <>
      <BottomNavBar></BottomNavBar>
      <div className="navbar bg-base-100 hidden md:flex">
          <div className="flex-none">
            <SideBar />
          </div>
          <div className="flex-1">
            {
              elements.map((element, index) => (
                <Link key={`${index}-link`} href={linksForElements[index]}>
                  <button className="btn btn-ghost text-xl">{element}</button>
                </Link>
              ))
            }
          </div>
          <div className="flex-none">
            <div className='tooltip tooltip-bottom' data-tip="Unprovisioned scan status">
              <IconElement apiUrl='provision' query='SCAN_ACTIVE' postKey='discovery' iconOn='/icons/bluetooth.svg' iconOff='/icons/bluetooth.svg' enableBlink={true} />
            </div>
            <div className='tooltip tooltip-bottom' data-tip="Toggle power">
              <IconElement apiUrl='controller' query='POWER' postKey='power' iconOn='/icons/power.svg' iconOff='/icons/power.svg' enableBlink={false} />
            </div>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow mt-3">
                <li><CheckBoxElement apiUrl="api/backend-control" query="STATUS" postKey="STATUS" text="Enable backend" /></li>
              </ul>
            </div>
          </div>
          <ErrorHandlerElement />
        </div>
      
    </>
  );
};

export default NavBar;
