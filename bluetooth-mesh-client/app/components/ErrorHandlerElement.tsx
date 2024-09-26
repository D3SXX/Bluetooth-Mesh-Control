"use client"
import React, { useEffect, useRef, useState } from "react";

import { fetcherGET, fetcherPOST } from "../utils/fetcher";

interface errorObj{
    "Error":string,
    "Error-status":boolean,
    "Extra-error-data":string
}

const ErrorHandlerElement = () => {
    const [data, setData] = useState<string | null>(null);
    const [obj, setObj] = useState<errorObj | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const start = () => {
      if (textareaRef.current) {
        const textareaValue = textareaRef.current.value;
        const msg = {"Message":textareaValue}
        fetcherPOST(msg)(`/api/data/set-config`)
      }
    };

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetcherGET("server?query=ERROR");
            const obj = JSON.parse(response)
            setData(obj["ERROR"]);
          } catch (err) {
            console.log(err);
          }
        };
        fetchData();
      }, []);
    
      useEffect(() => {
        if (data) {
          try {
            const json = JSON.parse(data);
            setObj(json);
          } catch (err) {
            console.log(err);
          }
        }
      }, [data]);
  
    return (
    <div>{obj && obj["Error-status"] && <div className="flex flex-col h-full"><button className="btn" onClick={()=>document.getElementById('error_modal').showModal()}>Fix error</button>
    <dialog id="error_modal" className="modal" open>
      <div className="modal-box w-2/3 h-2/3 max-w-fit max-h-fit">
            {obj.Error == "config" && <div>
                <h3 className="font-bold text-lg">Setting up config files</h3>
                <div>
                It seems that `meshctl` cannot locate or open the configuration files. This could be due to either the files not existing or incorrect JSON formatting. 
                <br></br>
                As a result, the application won't be able to communicate or function properly without the correct configuration files.
                <br></br>
                Would you like to create empty configuration files?
                </div>
                <textarea ref={textareaRef} className="textarea textarea-bordered w-full h-full flex-grow resize-y min-h-56">{obj["Extra-error-data"]}</textarea>
                </div>}
                
        <div className="modal-action">
          <form method="dialog" className="w-full flex justify-between">
            <div className="flex items-center ml-2">
            <button className="btn btn-error">Close</button>
            </div>
            <div className='ml-2 items-center flex'>
            <button className="btn btn-outline btn-success" onClick={start}>Start</button>
            </div>
          </form>
        </div>
      </div>
    </dialog></div>}
    </div>
  )
}

export default ErrorHandlerElement