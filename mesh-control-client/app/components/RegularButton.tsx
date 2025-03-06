"use client";
import React, { useEffect, useRef, useState } from "react";
import Toast from "./Toast";
import { fetcherPOST, fetcherDELETE, fetcherGET, fetcherPUT } from "../utils/fetcher";
import { isEmpty } from "../utils/isEmpty";

const RegularButton = ({
  apiUrl,
  requestData = {},
  text = "",
  style = "btn ml-2",
  uniqueId,
  method = "DELETE"
}: {
  apiUrl: string;
  query?: string;
  requestData?: object;
  text?: string;
  style: string;
  uniqueId: string;
  method?: string;
}) => {
  const [outputData, setOutputData] = useState<string | null>(null);
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [processStatus, setProcessStatus] = useState(false);
  const outputRef = useRef<HTMLUListElement>(null);

  const call = async (attempt: number) => {
    try {

      setOutputData(null);
      setIsCalled(true);
      const attemptElement = document.getElementById(`process-retry-status-${uniqueId}-${apiUrl}-${text}`);
      if (attemptElement) {
        attemptElement.innerHTML = `(Attempt ${attempt}/3)`;
      }
      let data;
      if (await isEmpty(requestData)) {
        if (method === "DELETE"){
          data = await fetcherDELETE(apiUrl);
        }
        else{
          data = await fetcherPUT(apiUrl);
        }
      } else {
        data = await fetcherPOST(requestData)(apiUrl);
      }

      setOutputData(data["message"]);
      setIsCalled(false);

      console.log(data);

      if (data["status"] === "success") {
        pollProcessStatus(attempt);
        (document.getElementById(`modal-${uniqueId}-${apiUrl}-${text}`) as HTMLFormElement).showModal()
      }

      setProgressValue(0);
    } catch (error) {
      console.error("Error:", error);
      setOutputData("Failed to send a request to the server");
      setIsCalled(false);
      setProgressValue(0);
    }
  };

  const pollProcessStatus = async (attempt: number) => {
    const interval = setInterval(async () => {
      const processResponse = await fetcherGET(`${apiUrl}?query=PROCESS`);

      console.log(processResponse);

      if (processResponse && processResponse["PROCESS"]) {
        setLogs(processResponse["PROCESS"]["LOGS"]);
        setProgressValue(processResponse["PROCESS"]["PROGRESS"]);
        setProcessStatus(processResponse["PROCESS"]["STATUS"]);
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
        if (processResponse["PROCESS"]["ERROR"]) {
          setIsCalled(false);
          setProgressValue(100);
          clearInterval(interval);
          console.log(attempt);
          if (attempt < 3) {
            call(attempt + 1);
          }
        }
        if (!processResponse["PROCESS"]["STATUS"]) {
          clearInterval(interval);
        }
      }
    }, 1000);
  };

  const openModal = () => {
    const modal = document.getElementById(`modal-${uniqueId}-${apiUrl}-${text}`) as HTMLFormElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <div className="w-full">
      <button onClick={() => call(1)} className={style}>
        {text || ""}
      </button>
      {outputData && <Toast message={outputData} timeout={10000}></Toast>}
      <dialog id={`modal-${uniqueId}-${apiUrl}-${text}`} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg items-center flex">Configuring Mesh <p className="ml-1" id={`process-retry-status-${uniqueId}-${apiUrl}-${text}`}></p> {processStatus && (<span className="loading loading-spinner loading-md ml-2"></span>)}</h3>
          <ul className="overflow-auto h-32 mt-2 border border-base-200 rounded-lg" ref={outputRef}>
            {logs.map((log, index) => (
              <li
                key={`log-${uniqueId}-${apiUrl}-${text}-${index}`}
                className={`${
                  index === logs.length - 1 ? "animate-pulse" : ""
                }`}
              >
                {log}
              </li>
            ))}
          </ul>
          <progress
            className="progress progress-primary w-full mt-4"
            value={progressValue}
            max={100}
          ></progress>

          <div className="modal-action">
            <form method="dialog">
              {!processStatus && <button className="btn">Close</button>}
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default RegularButton;
