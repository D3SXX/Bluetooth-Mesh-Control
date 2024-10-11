"use client";
import React, { useState, useEffect } from "react";
import TerminalOutputElement from "./TerminalOutputElement";
import IconElement from "./IconElement";

import useIsMobile from "../helpers/isMobile";
import { fetcherGET, fetcherPOST, fetcherDELETE } from "../utils/fetcher";

interface UnprovisionedNode {
  OOB: string;
  UUID: string;
  address: string;
  name: string;
}
interface NodesObj {
  [UUID: string]: UnprovisionedNode;
}

const ProvisionElement = () => {
  const [scanStatus, setScanStatus] = useState(false);
  const [unprovisionedNodes, setUnprovisionedNodes] = useState<
    UnprovisionedNode[]
  >([]);

  const isMobile = useIsMobile();

  const provision = async (uuid: string) => {
    setScanStatus(false);
    await fetcherPOST({ provision_node: uuid })(`/provision`);
  };

  const reset_unprovisioned_list = async () => {
    await fetcherDELETE("provision?reset=True");
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(async () => {
      try {
        const data = await fetcherGET(
          "/provision?query=UNPROVISIONED_NODES&query=SCAN_ACTIVE"
        );
        let obj;
        try {
          const nodesObj: NodesObj = data["UNPROVISIONED_NODES"];
          const nodesArray = Object.entries(nodesObj).map(
            ([UUID, nodeInfo]: [string, UnprovisionedNode]) => ({
              ...nodeInfo,
              UUID,
            })
          );
          setUnprovisionedNodes(nodesArray);
          setScanStatus(data["SCAN_ACTIVE"]);
        } catch (error) {
          console.error("Error parsing JSON:");
          console.log(error);
        }
      } catch (error) {
        console.error("Error during scan:", error);
      }
    }, 750);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [scanStatus]);

  const handleCheckboxChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setScanStatus(event.target.checked);
    try {
      await fetcherPOST({ discovery: event.target.checked })("/provision");
    } catch (error) {
      console.error("Error during scan toggle:", error);
    }
  };

  return (
    <div
      className={
        isMobile == false
          ? "join join-horizontal flex justify-between m-2"
          : "join join-vertical flex"
      }
    >
      <div
        className={`${
          isMobile == false
            ? "bg-base-100 collapse collapse-open border-base-300 border  w-1/2 mr-2"
            : "bg-base-100 collapse collapse-open border-base-300 border rounded-none"
        }`}
      >
        <div className="collapse-title text-xl font-medium flex items-center justify-between ">
          <div className="flex items-center ml-2">
            <span>Toggle Scan</span>
            <input
              type="checkbox"
              className="toggle ml-2"
              checked={scanStatus}
              onChange={handleCheckboxChange}
              id="scan-toggle"
            />
            {scanStatus && isMobile == true && (
              <span className="ml-4 loading loading-spinner loading-md"></span>
            )}
          </div>
          <div className="ml-2 items-center flex">
            <div
              className="tooltip tooltip-bottom"
              data-tip="Toggle Fallback Scan"
            >
              <IconElement
                apiUrl="provision"
                query="USE_FAILBACK_SCAN"
                postKey="failback_scan"
                iconOn="/icons/scan.svg"
                iconOff="/icons/scan.svg"
                enableBlink={false}
              ></IconElement>
            </div>
            {unprovisionedNodes.length > 0 && (
              <div className="tooltip tooltip-bottom" data-tip="Reset list">
                <div
                  className="btn btn-ghost text-[26px]"
                  onClick={reset_unprovisioned_list}
                >
                  &#x2672;
                </div>
              </div>
            )}
            {scanStatus && isMobile == false && (
              <div className="items-center flex">
                Scanning
                <span className="loading loading-spinner loading-md ml-2"></span>
              </div>
            )}
          </div>
        </div>
        <div className="collapse-content">
          {scanStatus && unprovisionedNodes.length <= 0 && (
            <div className="text-gray-500 ">
              Scanning for unprovisioned nodes... <br></br>(Try to toggle power
              if the scan cannot find node)
            </div>
          )}
          <div
            className={
              isMobile == false
                ? "rounded-lg min-h-60 max-h-[75vh] mb-4 overflow-scroll"
                : "rounded-lg min-h-60 max-h-[75vh] mb-4 overflow-scroll mr"
            }
          >
            {unprovisionedNodes.length > 0 ? (
              <div>
                {unprovisionedNodes.map((node, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      (
                        document.getElementById(
                          `modal-${index}`
                        ) as HTMLFormElement
                      ).showModal()
                    }
                    className="btn h-fit btn-ghost stats shadow mb-1 mt-1 border-base-200 border w-full"
                  >
                    <div className="join join-horizontal flex items-center flex-wrap justify-center text-center">
                      <div className="stat join-item w-full sm:w-auto">
                        Name:
                        <br />
                        <div className="font-normal mt-1">{node.name}</div>
                      </div>
                      <div className="stat join-item w-full sm:w-auto">
                        Address:
                        <br />
                        <div className="font-normal mt-1">{node.address}</div>
                      </div>
                      <div className="stat join-item w-full sm:w-auto">
                        UUID:
                        <br />
                        <div className="font-normal mt-1 break-all">
                          {node.UUID}
                        </div>
                      </div>
                      <div className="stat join-item w-full sm:w-auto">
                        OOB:
                        <br />
                        <div className="font-normal mt-1">{node.OOB}</div>
                      </div>
                    </div>
                    <dialog id={`modal-${index}`} className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">Warning</h3>
                        <div className="py-4 text-lg font-normal">
                          <div className="mb-2">
                            Do you want to provision this node?
                          </div>
                          <div>
                            <form
                              method="dialog"
                              className="w-full flex justify-between"
                            >
                              <button className="btn btn-error">Cancel</button>
                              <button
                                className="btn btn-outline btn-success break-all min-w-min"
                                onClick={() => provision(node.UUID)}
                              >
                                <p
                                  className={
                                    isMobile ? "break-all max-w-48" : ""
                                  }
                                >
                                  Provision {node.UUID}
                                </p>
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                ))}
              </div>
            ) : (
              !scanStatus && (
                <div className="text-neutral-content">
                  Unprovisioned nodes list is is empty
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className={`${isMobile == false ? "w-1/2 " : ""}`}>
        <TerminalOutputElement isMobile={isMobile}></TerminalOutputElement>
      </div>
    </div>
  );
};

export default ProvisionElement;
