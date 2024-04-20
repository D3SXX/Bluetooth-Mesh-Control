"use client"

import React, { useState } from 'react';
import ActionButton from './ActionButton'
import TerminalOutput from './TerminalOutput'
import Toast from './Toast';

const ProvisioningElement = () => {
        const [isTerminalOutputVisible, setIsTerminalOutputVisible] = useState(false);
        const toggleTerminalOutput = () => {
                setIsTerminalOutputVisible(isTerminalOutputVisible => true);
              };

  return (
    <div>
        <div className="join w-full">
          <div className="w-1/2 mr-2">
        <ActionButton text="Scan unprovisioned nodes" 
        actionText="Scanning for unprovisioned nodes" 
        command="scan-unprovisioned-nodes" 
        interval={1} 
        enableProgressBar={true}
        toggleTerminalOutput={toggleTerminalOutput}></ActionButton>
        </div>
        <div className="w-1/2">
        {isTerminalOutputVisible && <TerminalOutput command="" title="Provision Output" />}
        </div>
  </div>
    </div>
  )
}

export default ProvisioningElement
