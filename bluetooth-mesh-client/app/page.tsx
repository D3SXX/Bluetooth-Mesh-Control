import Image from "next/image";
import NavBar from "./components/NavBar";
import Link from "next/link";

export default function Home() {
  const items = {
    i: [
      { name: "Provision", link: "/provision", icon: "/icons/provision.png" },
      { name: "Nodes", link: "/nodes", icon: "/icons/nodes.png"},
      { name: "Keys", link: "/keys", icon: "/icons/keys.png"},
      { name: "Status", link: "/status", icon: "/icons/status.png"},
    ],
  };

  return (
    <main>
      <NavBar></NavBar>
      <div className="m-2">
        {items.i.map((item, itemIndex) => (
          <div key={`item-${item}`} className="inline-flex mr-2 mb-2">
            <Link href={item.link}>
            <button className="btn bg-base-100 h-44 w-32 inline">
              <Image src={item.icon || ""} width={100} height={100} alt={"Go to "}></Image>
              <p className="p-2">{item.name}</p>
            </button>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
