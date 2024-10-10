import NavBar from "./components/NavBar";
import IconButtonLinks from "./components/IconButtonLinks";

import { redirect } from 'next/navigation'

export default function Home() {
  
  return (
    <main>
      <NavBar></NavBar>
      <IconButtonLinks></IconButtonLinks>
    </main>
  );
}
