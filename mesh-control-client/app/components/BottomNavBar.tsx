
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { usePathname } from 'next/navigation'

const BottomNavBar = () => {

    const pathname = usePathname()
    
    const items = {
        i: [
          { name: "Provision", link: "/provision", icon: "/icons/provision.png" },
          { name: "Nodes", link: "/nodes", icon: "/icons/nodes.png"},
          { name: "Keys", link: "/keys", icon: "/icons/keys.png"},
          { name: "Status", link: "/status", icon: "/icons/stats.png"},
        ],
      };

  return (
    <div className="btm-nav w-screen">
        {items.i.map((item, index) => (
            <div key={`bottom-navbar-${index}`} className={` ${item.link === pathname ? "active" : ""}`}>
            <Link href={item.link} className='w-full'>
            <button className={`btn bg-base-100 w-full rounded-none border-none`}>
            <Image src={item.icon || ""} width={30} height={30} alt={""}></Image>
            <p>{item.name}</p>
                </button>
                </Link>
                </div>
        ))}

    </div>
  )
}

export default BottomNavBar