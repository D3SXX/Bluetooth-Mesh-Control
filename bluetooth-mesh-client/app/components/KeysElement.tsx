"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Tooltip } from "react-tooltip";
import TooltipElement from "./TooltipElement";
import RegularButton from "./RegularButton";
import Toast from "./Toast";
import { json } from "stream/consumers";
import NoProvisionedNodes from "./NoProvisionedNodes";

import { fetcherGET } from "../utils/fetcher";

interface DataInterface {
  APPKEYS: {
    boundNetKey: number;
    index: number;
    key: string;
  }[];
  BIND: {
    [key: string]: {
      APPKEY_INDEX?: number;
      MODEL?: string;
    };
  };
  NETKEYS: {
    ASSIGNED_NODES?: [];
    index?: number;
    key?: string;
    keyRefresh?: number;
  }[];
  PUBLISH: {
    [key: string]: {
      ADDRESS?: string;
      APPKEY_INDEX?: number;
      TTL?: number;
    };
  };
  SUBSCRIBE: {
    [key: string]: {
      ADDRESS_LIST?: [];
    };
  };
}

const KeysElement = () => {
  const [appKeyModalSelected, setappKeyModalSelected] = useState(1);
  const [selectedAppKeyEdit, setSelectedAppKeyEdit] = useState(-1);
  const [selectedBoundNetKeyEdit, setSelectedBoundNetKeyEdit] = useState(0);
  const [selectedNetKeyBound, setSelectedNetKeyBound] = useState("");
  const [selectedAppKeyRemove, setSelectedAppKeyRemove] = useState("");
  const [inputAppKeyAddValue, setInputAppKeyAddValue] = useState("");
  const [inputAppKeyEditValue, setInputAppKeyEditValue] = useState("");

  const handleAddAppKeyValueChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputAppKeyAddValue(event.target.value);
  };

  const handleEditAppKeyValueChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputAppKeyEditValue(event.target.value);
  };

  const handleappKeyModal = (option: React.SetStateAction<number>) => {
    setappKeyModalSelected(option);
    const contentFirst = document.getElementById(`appKeyConfigContent-1`);
    const contentSecond = document.getElementById(`appKeyConfigContent-2`);
    const contentThird = document.getElementById(`appKeyConfigContent-3`);
    switch (option) {
      case 1:
        contentFirst?.classList.remove("hidden");
        contentSecond?.classList.add("hidden");
        contentThird?.classList.add("hidden");
        break;
      case 2:
        contentFirst?.classList.add("hidden");
        contentSecond?.classList.remove("hidden");
        contentThird?.classList.add("hidden");
        break;
      case 3:
        contentFirst?.classList.add("hidden");
        contentSecond?.classList.add("hidden");
        contentThird?.classList.remove("hidden");
        break;
    }
  };

  const request = "keys";
  const { data, error, isLoading } = useSWR(request, fetcherGET, {
    refreshInterval: 0,
  });
  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <div>
        loading <span className="loading loading-spinner text-primary"></span>
      </div>
    );

  let obj: DataInterface;
  obj = data;
  let renderedElements;

  console.log(JSON.stringify(data));

  if ("APPKEYS" in obj) {
    renderedElements = (
      <div className="w-full">
        <div key={1} className="bg-base-100 join join-vertical me-2 mb-2 ">
          <div className="join-item text-center mt-1 mb-1 font-bold border-base-300 border-b text-lg">
            Application Keys
          </div>
          <div className="join-item collapse collapse-arrow border border-t-0 border-base-300 ">
            <input type="checkbox" className="peer" />
            <div className="collapse-title bg-base-100">Available Keys</div>
            <div className="collapse-content">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Index</th>
                      <th>Bound network key</th>
                      <th>Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obj.APPKEYS.map((appKey, index) => (
                      <tr className="hover" key={index}>
                        <th>{appKey.index}</th>
                        <td>{appKey.boundNetKey}</td>
                        <td>{appKey.key}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="join-item collapse collapse-arrow border border-base-300 ">
            <input type="checkbox" className="peer" />
            <div
              className="collapse-title bg-base-100"
              data-tooltip-id={`tooltip-netkey`}
              data-ripple-light="true"
            >
              Assigned Keys
            </div>
            <div className="collapse-content bg-base-100">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Node Address</th>
                      <th>Type</th>
                      <th>Model ID</th>
                      <th>Key Index/Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obj.BIND &&
                      Object.keys(obj.BIND).map((key, bindIndex) => (
                        <React.Fragment key={`bind_${bindIndex}`}>
                          <tr className="hover">
                            <th>{key}</th>
                            <td>Bind</td>
                            <td>{obj.BIND![key].MODEL}</td>
                            <td>{obj.BIND![key].APPKEY_INDEX}</td>
                          </tr>

                          {obj.PUBLISH && obj.PUBLISH[key] && (
                            <tr className="hover" key={`publish_${bindIndex}`}>
                              <th>{key}</th>
                              <td>Publish</td>
                              <td>{obj.BIND![key].MODEL}</td>
                              <td>{obj.PUBLISH![key].ADDRESS}</td>
                            </tr>
                          )}

                          {obj.SUBSCRIBE && obj.SUBSCRIBE[key] && (
                            <tr className="hover" key={`publish_${bindIndex}`}>
                              <th>{key}</th>
                              <td>Subscribe</td>
                              <td>{obj.BIND![key].MODEL}</td>
                              <td>
                                {obj.SUBSCRIBE[key].ADDRESS_LIST?.map(
                                  (address, addressIndex) => (
                                    <span
                                      key={`subscribe_${bindIndex}_${addressIndex}`}
                                    >
                                      {address}
                                      {addressIndex <
                                      obj.SUBSCRIBE[key].ADDRESS_LIST.length - 1
                                        ? ", "
                                        : ""}
                                    </span>
                                  )
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="join-item">
            <button
              className="btn border border-base-300 bg-base-100 w-full"
              onClick={() =>
                document.getElementById("appKeyConfigModal")?.showModal()
              }
            >
              Edit keys configuration
            </button>
            <dialog id="appKeyConfigModal" className="modal">
              <div className="modal-box min-h-56">
                <h3 className="font-bold text-lg">
                  Application keys configuration
                  <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box w-full mt-2">
                    <li
                      className={`m-auto ${
                        appKeyModalSelected === 1
                          ? "border-b-2 border-neutral-700"
                          : ""
                      }`}
                      onClick={() => handleappKeyModal(1)}
                    >
                      <a>Add a new key</a>
                    </li>
                    <li
                      className={`m-auto ${
                        appKeyModalSelected === 2
                          ? "border-b-2 border-neutral-700"
                          : ""
                      }`}
                      onClick={() => handleappKeyModal(2)}
                    >
                      <a>Edit a key</a>
                    </li>
                    <li
                      className={`m-auto ${
                        appKeyModalSelected === 3
                          ? "border-b-2 border-neutral-700"
                          : ""
                      }`}
                      onClick={() => handleappKeyModal(3)}
                    >
                      <a>Remove a key</a>
                    </li>
                  </ul>
                </h3>
                <p className="py-4 space-x-2">
                  <div id="appKeyConfigContent-1" className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type any key.."
                      value={inputAppKeyAddValue}
                      onChange={handleAddAppKeyValueChange}
                      className="input input-bordered w-full "
                    />
                    <div className="items-center">
                      <select
                        className="select select-bordered w-full"
                        onChange={(e) => setSelectedNetKeyBound(e.target.value)}
                      >
                        <option disabled selected>
                          Select any network key to bound..
                        </option>
                        {obj.NETKEYS &&
                          obj.NETKEYS.map((netKey, index) => (
                            <option key={`content1-${netKey.key}-bound`} value={netKey.index}>
                              Bound to key {netKey.index}: {netKey.key}
                            </option>
                          ))}
                      </select>
                      <RegularButton
                        style="mt-2 w-full btn bg-base-100 border border-base-300"
                        apiUrl="keys"
                        requestData={{
                          "add_appkey":{
                          key: inputAppKeyAddValue,
                          boundNetKey: selectedNetKeyBound,
                        }}}
                        text="Add key"
                        uniqueId="content-1"
                      ></RegularButton>
                    </div>
                  </div>
                  <div id="appKeyConfigContent-2" className="hidden space-y-2">
                    <select
                      className="select select-bordered w-full"
                      onChange={(e) => {
                        setSelectedAppKeyEdit(Number(e.target.value));
                        setInputAppKeyEditValue(
                          obj.APPKEYS[Number(e.target.value)].key
                        );
                        setSelectedBoundNetKeyEdit(
                          obj.APPKEYS[Number(e.target.value)].boundNetKey
                        );
                      }}
                    >
                      <option disabled selected>
                        Select any key to edit..
                      </option>
                      {obj.APPKEYS &&
                        obj.APPKEYS.map((appKey, index) => (
                          <option key={`content2-${appKey.key}-edit`} value={appKey.index}>
                            Key index {appKey.index}: {appKey.key}
                          </option>
                        ))}
                    </select>
                    {selectedAppKeyEdit >= 0 && (
                      <input
                        type="text"
                        placeholder="Type any key.."
                        value={inputAppKeyEditValue}
                        onChange={handleEditAppKeyValueChange}
                        className="input input-bordered w-full"
                      />
                    )}
                    {selectedAppKeyEdit >= 0 && (
                      <div className="items-center">
                        <select
                          className="select select-bordered w-full"
                          onChange={(e) =>
                            setSelectedBoundNetKeyEdit(Number(e.target.value))
                          }
                        >
                          {obj.NETKEYS.map((key, index) => (
                            <option
                              value={key.index}
                              selected={
                                selectedAppKeyEdit >= 0 ? (key.index ==
                                obj.APPKEYS[selectedAppKeyEdit].boundNetKey)
                                : false
                              }
                              key={`content3-${key.key}-bound`}
                            >
                              Bound to key {key.index}: {key.key}
                            </option>
                          ))}
                        </select>
                        <RegularButton
                          style="mt-2 w-full btn bg-base-100 border border-base-300"
                          apiUrl="keys"
                          requestData={{"edit-key":{
                            index: selectedAppKeyEdit,
                            key: inputAppKeyEditValue,
                            boundNetKey: selectedBoundNetKeyEdit,
                          }}}
                          text="Edit key"
                          uniqueId="content-2"
                        ></RegularButton>
                      </div>
                    )}
                    
                  </div>
                  <div id="appKeyConfigContent-3" className="hidden">
                    <div className="items-center">
                      <select
                        className="select select-bordered w-full"
                        onChange={(e) =>
                          setSelectedAppKeyRemove(e.target.value)
                        }
                      >
                        <option disabled selected>
                          Select any key to remove..
                        </option>
                        {obj.APPKEYS &&
                          obj.APPKEYS.map((appKey, index) => (
                            <option value={appKey.key} key={`content3-${appKey.key}-remove`}>
                              Key index {appKey.index}: {appKey.key}
                            </option>
                          ))}
                      </select>
                      {selectedAppKeyRemove && (
                        <RegularButton
                          style="mt-2 w-full btn bg-base-100 border border-base-300"
                          apiUrl={`keys?appkey=${selectedAppKeyRemove}`}
                          text="Remove key"
                          uniqueId="content-3"
                        ></RegularButton>
                      )}
                    </div>
                  </div>
                </p>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
          </div>
        </div>
        <div key={2} className="bg-base-100 join join-vertical me-2 mb-2">
          <div
            className="join-item text-center mt-1 mb-1 font-bold border-base-300 border-b text-lg"
            data-tooltip-id={`tooltip-nodeid-${1}`}
            data-ripple-light="true"
          >
            Network Keys
          </div>
          <div className="join-item collapse collapse-arrow border border-t-0 border-base-300 ">
            <input type="checkbox" className="peer" />
            <div className="collapse-title bg-base-100">Available Keys</div>
            <div className="collapse-content ">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Index</th>
                      <th>Key refresh</th>
                      <th>Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obj.NETKEYS.map((netKey, index) => (
                      <tr className="hover" key={index}>
                        <th>{netKey.index}</th>
                        <td>{netKey.keyRefresh?.toString()}</td>
                        <td>{netKey.key}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="join-item collapse collapse-arrow border border-base-300 ">
            <input type="checkbox" className="peer" />
            <div
              className="collapse-title bg-base-100"
              data-tooltip-id={`tooltip-netkey`}
              data-ripple-light="true"
            >
              Assigned Keys
            </div>
            <div className="collapse-content">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Node Device Key</th>
                      <th>Key Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obj.NETKEYS.map((key, keyIndex) =>
                      key.ASSIGNED_NODES?.map((deviceKey, index) => (
                        <tr
                          className="hover"
                          key={`Netkey_${key}_${deviceKey}`}
                        >
                          <td>{deviceKey}</td>
                          <td>{key.index}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>{renderedElements ? renderedElements : <NoProvisionedNodes />}</div>
  );
};

export default KeysElement;
