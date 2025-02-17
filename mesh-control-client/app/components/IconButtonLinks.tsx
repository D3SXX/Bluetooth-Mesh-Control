"use client"
import React from 'react'
import useIsDarkMode from '../helpers/isDarkMode';
import Link from 'next/link';
import Image from 'next/image';

const IconButtonLinks = () => {

    const isDarkMode = useIsDarkMode();

    const items = {
        i: [
          { name: "Provision", link: "/provision", icon: "/icons/provision.svg" },
          { name: "Nodes", link: "/nodes", icon: "/icons/nodes.svg" },
          { name: "Keys", link: "/keys", icon: "/icons/keys.svg" },
          { name: "Status", link: "/status", icon: "/icons/stats.svg" },
        ],
      };

  return (
    <div className="mb-16">  {items.i.map((item, itemIndex) => (
        <div key={`item-${item}`} className="flex md:inline-flex md:m-2 md:mr-0">
          <Link href={item.link}>
            <button className="btn bg-base-100 h-44 w-screen md:w-32 md:inline flex items-center justify-center rounded-none md:rounded-xl">
              <Image
                src={item.icon || ""}
                width={100}
                height={100}
                alt={"Go to "}
                className={isDarkMode ? "filter-invert-dark" : "filter-invert-not-selected"}
              ></Image>
              <p className="p-2 text-2xl md:text-lg">{item.name}</p>
            </button>
          </Link>
        </div>
      ))}</div>
  )
}

export default IconButtonLinks