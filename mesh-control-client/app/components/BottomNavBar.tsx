import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import useIsDark from "../helpers/isDarkMode";

const BottomNavBar = () => {
  const pathname = usePathname();
  const isDarkMode = useIsDark();

  const items = {
    i: [
      { name: "Provision", link: "/provision", icon: "/icons/provision.svg" },
      { name: "Nodes", link: "/nodes", icon: "/icons/nodes.svg" },
      { name: "Keys", link: "/keys", icon: "/icons/keys.svg" },
      { name: "Status", link: "/status", icon: "/icons/stats.svg" },
    ],
  };
  
  return (
    <div className="btm-nav w-screen z-10 bg-base-200">
      {items.i.map((item, index) => (
        <div
          key={`bottom-navbar-${index}`}
          className={` ${
            item.link === pathname ? "active rounded-sm" : "rounded-sm"
          }`}
        >
          <Link href={item.link} className="w-full">
            <button className={`btn btn-ghost w-full rounded-none border-none`}>
              <Image
                src={item.icon || ""}
                width={30}
                height={30}
                alt={""}
                className={`${
                  item.link === pathname
                    ? "filter-invert-selected"
                    : isDarkMode ? "filter-invert-dark" : "filter-invert-not-selected"
                }`}
              ></Image>
              <p>{item.name}</p>
            </button>
          </Link>
          
        </div>
      ))}
    </div>
  );
};

export default BottomNavBar;
