"use client";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import { fetcherPOST, fetcherDELETE, fetcherGET } from "../utils/fetcher";
import { isEmpty } from "../utils/isEmpty";

const RegularButton = ({
  apiUrl,
  requestData = {},
  text = "",
  style = "btn ml-2",
  timeout = undefined,
}: {
  apiUrl: string;
  query?: string;
  requestData?: object;
  text?: string;
  style: string;
  timeout?: number;
}) => {
  const [outputData, setOutputData] = useState<string | null>(null);
  const [isCalled, setIsCalled] = useState<boolean>(false);
  const [progressValue, setProgressValue] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [processStatus, setProcessStatus] = useState(false);

  const call = async () => {
    try {
      setOutputData(null);
      setIsCalled(true);
      let data;
      if (await isEmpty(requestData)) {
        data = await fetcherDELETE(apiUrl);
      } else {
        data = await fetcherPOST(requestData)(apiUrl);
      }

      setOutputData(data["message"]);
      setIsCalled(false);

      if (data["status"] === "success") {
        pollProcessStatus();
        document.getElementById(`modal-${apiUrl}`)?.showModal()
      }

      setProgressValue(0);
    } catch (error) {
      console.error("Error:", error);
      setOutputData("Failed to send a request to the server");
      setIsCalled(false);
      setProgressValue(0);
    }
  };

  const pollProcessStatus = async () => {
    const interval = setInterval(async () => {
      const processResponse = await fetcherGET(`${apiUrl}?query=PROCESS`);

      if (processResponse && processResponse["PROCESS"]) {
        setLogs(processResponse["PROCESS"]["LOGS"]);
        setProgressValue(processResponse["PROCESS"]["PROGRESS"]);
        setProcessStatus(processResponse["PROCESS"]["STATUS"]);

        if (!processResponse["PROCESS"]["STATUS"]) {
          clearInterval(interval);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isCalled && timeout) {
      progressInterval = setInterval(() => {
        setProgressValue((prevValue) => {
          const newValue = prevValue + 1;
          if (newValue >= timeout * 10) {
            clearInterval(progressInterval);
            setIsCalled(false);
          }
          return newValue;
        });
      }, 100);
    }
    return () => clearInterval(progressInterval);
  }, [isCalled, timeout]);

  return (
    <div className="w-full">
      <button onClick={call} className={style}>
        {text || ""}
      </button>

      {isCalled && timeout && (
        <progress
          className="progress progress-primary w-100"
          value={progressValue}
          max={timeout * 10}
        ></progress>
      )}

      {outputData && <Toast message={outputData} timeout={10000}></Toast>}
      <dialog id={`modal-${apiUrl}`} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg items-center flex">Configuring Mesh {processStatus && (<span className="loading loading-spinner loading-md ml-2"></span>)}</h3>
          <ul className="overflow-auto h-32 mt-2 border border-base-200 rounded-lg">
            {logs.map((log, index) => (
              <li
                key={index}
                className={`${
                  index === logs.length - 1 ? "text-info-content animate-pulse hover" : ""
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
