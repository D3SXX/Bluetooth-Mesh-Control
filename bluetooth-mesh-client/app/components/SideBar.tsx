import React from 'react'
import Link from 'next/link'
const SideBar = () => {
  const elements = ["Home","Provision","Nodes","Keys","Status"];
  const linksForElements = ["/","/provision","/nodes","/keys","/status"];
  return (
    <div>
      <div className="drawer z-10">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}
          <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>

        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content text-xl font-bold">
            {/* Sidebar content here */}
            <li><label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay">&#11148; Go back</label></li>
            {elements.map((element, index) => <li key={`SideBar-${index}`}><Link href={linksForElements[index]}>{element}</Link></li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SideBar
