"use client"
import React, { useEffect, useRef, useState } from "react";

import { fetcherGET, fetcherPOST } from "../utils/fetcher";
import Toast from "./Toast";

interface errorObj{
    MESSAGE:string,
    STATUS:boolean,
    TYPE:string
    EXTRA_DATA: {
      [key: string]: string | undefined;
    };
}

const ErrorHandlerElement = () => {
    const [data, setData] = useState<errorObj | null>(null);
    const textareaRef1 = useRef<HTMLTextAreaElement>(null);
    const textareaRef2 = useRef<HTMLTextAreaElement>(null);
    const [lastResponse, setLastResponse] = useState("");
    const [appKeyModalSelected, setappKeyModalSelected] = useState(1);

    const start = async () => {
      if (textareaRef1.current && textareaRef2.current) {
        const textareaValue1 = textareaRef1.current.value;
        const textareaValue2 = textareaRef2.current.value;
        const msg = {"config":{"prov_db":textareaValue1,"local_node":textareaValue2}}
        const response = await fetcherPOST(msg)(`/config`);
        setLastResponse(response["message"]);
      }
    };

    const handleappKeyModal = (option: React.SetStateAction<number>) => {
      setappKeyModalSelected(option);
      const contentFirst = document.getElementById(`ErrorModal-1`);
      const contentSecond = document.getElementById(`ErrorModal-2`);
      switch (option) {
        case 1:
          contentFirst?.classList.remove("hidden");
          contentSecond?.classList.add("hidden");
          break;
        case 2:
          contentFirst?.classList.add("hidden");
          contentSecond?.classList.remove("hidden");
          break;
      }
    };

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetcherGET("server?query=ERROR");
            setData(response["ERROR"]);
          } catch (err) {
            console.log(err);
          }
        };
        fetchData();
      }, []);
    
    return (
    <div>{data && data["STATUS"] && <div className="flex flex-col h-full"><button className="btn" onClick={() => {
      const dialog = document.getElementById('error_modal') as HTMLDialogElement | null; dialog?.showModal()}
  }>Fix error</button>
    <dialog id="error_modal" className="modal" open>
      <div className="modal-box w-fit h-fit max-w-fit max-h-fit">
            {data.TYPE == "CONFIG" && <div>
                <h3 className="font-bold text-lg">Setting up config files</h3>
                <div>
                It seems that MeshControl cannot locate or open the configuration files. This could be due to either the files not existing or incorrect JSON formatting. 
                <br></br>
                Would you like to create a new configuration?
                </div>
                <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box w-full mt-2 mb-2">
                    <li
                      className={`m-auto ${
                        appKeyModalSelected === 1
                          ? "border-b-2 border-neutral-700"
                          : ""
                      }`}
                      onClick={() => handleappKeyModal(1)}
                    >
                      <a>prov_db.json</a>
                    </li>
                    <li
                      className={`m-auto ${
                        appKeyModalSelected === 2
                          ? "border-b-2 border-neutral-700"
                          : ""
                      }`}
                      onClick={() => handleappKeyModal(2)}
                    >
                      <a>local_node.json</a>
                    </li>
                  </ul>
                <div id="ErrorModal-1" className="space-y-2">
                <textarea ref={textareaRef1} rows={10} className="textarea textarea-bordered w-full h-full flex-grow resize-y">{data["EXTRA_DATA"]["prov_db.json"]}</textarea>
                </div>
                <div id="ErrorModal-2" className="hidden space-y-2">
                <textarea ref={textareaRef2} rows={10} className="textarea textarea-bordered w-full h-full flex-grow resize-y">{data["EXTRA_DATA"]["local_node.json"]}</textarea>
                </div>
                </div>}
                
        <div className="modal-action">
          <form method="dialog" className="w-full flex justify-end">
            <div className="flex items-center ml-2">
            <button className="btn btn-error ">Close</button>
            </div>
            <div className='ml-2 items-center flex'>
            <button className="btn btn-outline btn-success" onClick={start}>Start</button>
            </div>
          </form>
        </div>
      </div>
    </dialog></div>}
    {lastResponse && <Toast message={lastResponse} timeout={10000}></Toast>}
    </div>
  )
}

export default ErrorHandlerElement