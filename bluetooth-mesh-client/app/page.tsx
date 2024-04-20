import Image from "next/image";
import NavBar from "./components/NavBar";
import DataElement from "./components/DataElement";
import ActionButton from "./components/ActionButton";
import Terminal from "./components/Terminal";
import TerminalOutput from "./components/TerminalOutput";
import Toast from "./components/Toast";
import ProvisioningElement from "./components/ProvisioningElement";


export default function Home() {
  return (
    <main>
      <NavBar></NavBar>
      <div className="m-2">
      <ProvisioningElement></ProvisioningElement>
</div>
        
    </main>
  );
}
