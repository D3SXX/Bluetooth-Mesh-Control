"use client"
import React from 'react'
import useIsDarkMode from '../helpers/isDarkMode';
import useIsMobile from '../helpers/isMobile';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation'

const IconButtonLinks = () => {

    const isDarkMode = useIsDarkMode();
    const isMobile = useIsMobile()

    if (isMobile === true){
        redirect("/provision")
    }

    const items = {
        i: [
          { name: "Provision", link: "/provision", icon: "/icons/provision.png" },
          { name: "Nodes", link: "/nodes", icon: "/icons/nodes.png" },
          { name: "Keys", link: "/keys", icon: "/icons/keys.png" },
          { name: "Status", link: "/status", icon: "/icons/stats.png" },
        ],
      };

  return (
    <div>  {items.i.map((item, itemIndex) => (
        <div key={`item-${item}`} className="inline-flex m-2 mr-0">
          <Link href={item.link}>
            <button className="btn bg-base-100 h-44 w-32 inline">
              <Image
                src={item.icon || ""}
                width={100}
                height={100}
                alt={"Go to "}
                className={isDarkMode ? "filter-invert-dark" : "filter-invert-not-selected"}
              ></Image>
              <p className="p-2">{item.name}</p>
            </button>
          </Link>
        </div>
      ))}</div>
  )
}

export default IconButtonLinks