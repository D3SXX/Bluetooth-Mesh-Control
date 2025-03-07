"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Tooltip } from "react-tooltip";
import TooltipElement from "./TooltipElement";
import Link from "next/link";
import RegularButton from "./RegularButton";
import NoProvisionedNodes from "./NoProvisionedNodes";

import { fetcherGET } from "../utils/fetcher";

interface nodeObject {
  appKeys: {
    index: number;
    boundNetKey: number;
    key: string;
  }[];
  nodes: {
    deviceKey: string;
    configuration: {
      netKeys: string[];
      elements: {
        elementIndex: number;
        unicastAddress: string;
        bind: string[];
        publish: {
          address: string;
          index: string;
          ttl: number;
        };
      }[];
    };
    composition: {
      cid: string;
      cidName: string;
      pid: string;
      vid: string;
      crpl: string;
      features: {
        relay: boolean;
        proxy: boolean;
        friend: boolean;
        lpn: boolean;
      };
      elements: {
        elementIndex: number;
        location: string;
        models: string[];
        model_names: string[];
      }[];
    };
    IVindex: number;
    sequenceNumber: number;
  }[];
}

const tooltipText = {
  "Company ID": "Identifier of the manufacturer",
  "Product ID": "Identifier of the product",
  "Version ID": "Identifier of the version",
  relay: "Ability to receive and retransmit messages to enable larger networks",
  proxy:
    "Ability to receive and retransmit Messages between GATT and advertising bearers",
  friend:
    "Ability to help a Node supporting the Low Power feature to operate efficiently",
  lpn: "Ability to operate with reduced receiver duty cycles in a mesh network by working with a Friend node",
  nonce:
    "A nonce is a unique number used once to prevent replay attacks in communications security.",
  IVindex:
    "The IV Index is a 32-bit value which is shared by all Nodes in a network",
  sequenceNumber:
    "The sequence number is a unique identifier for messages that ensures proper sequencing and dublicate prevention",
  networkKey: "",
  element: "",
  elementAddress: "",
  Location: "",
  Model: "",
  bind: "",
  bindElementModel: "",
  bindApplicationKey: "",
  subscribePublishElementModel: "",
  subscribePublishAddress: "Everyone: Broadcasts to all nodes (0xFFFF).<br>Group address: Multicast to specific element groups.<br>Unicast address: Direct communication with one element.",
  subscribePublishPublicationPeriod: "",
  subscribePublishRetransmissionCount: "",
  subscribePublishApplicationKey: "",
};

// Many descriptions are taken from https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/mesh/mesh-glossary/

const NodesElement = () => {
  // For binding (bind <ele_idx> <app_idx> <mod_id> [cid])
  const [selectedBindElementIndex, setSelectedBindElementIndex] = useState<{ [key: number]: number }>({});
  const [selectedBindAppKeyIndex, setSelectedBindAppKeyIndex] = useState<{ [key: number]: number }>({});
  const [selectedBindModelValue, setSelectedBindModelValue] = useState<{ [key:number]: string}>({});

  // For publishing (pub-set <ele_addr> <pub_addr> <app_idx> <per (step|res)> <re-xmt (cnt|per)> <mod id> [cid])
  const [selectedPublishElementIndex, setSelectedPublishElementIndex] =
    useState<{ [key:number]: number}>({});
  const [inputPublishAddressValue, setInputPublishAddressValue] =
    useState<{ [key: number]: string}>({});
  const [selectedPublishAppKeyIndex, setSelectedPublishAppKeyIndex] =
  useState<{ [key:number]: number}>({});
  const [inputPublishPublicationPeriod, setInputPublishPublicationPeriod] =
    useState<{ [key:number]: number}>({});
  const [inputPublishRetransmissionCount, setInputPublishRetransmissionCount] =
    useState<{ [key: number]: number}>({});
  const [selectedPublishModelValue, setSelectedPublishModelValue] =
    useState<{ [key:number]: string}>({});

  const [allowAddressInput, setAllowAddressInput] = useState<{ [key:number]: boolean}>({});
  const [suggestAddressInput, setSuggestAddressInput] =
    useState<{[key:number]: string}>({});

  const handleAddressSelection = (e: React.ChangeEvent<HTMLSelectElement>, nodeIndex: number) => {
    
    switch (e.target.value) {
      case "0":
        setAllowAddressInput((prevState => ({...prevState, [nodeIndex] : false})));
        setInputPublishAddressValue(prevState => ({...prevState, [nodeIndex] : "0xFFFF"}));
        return;
      case "1":
        setSuggestAddressInput(prevState => ({...prevState, [nodeIndex] : "Type here (e.g. 0xC000)"}));
        setInputPublishAddressValue(prevState => ({...prevState, [nodeIndex] : "0xC000"}));
        break;
      case "2":
        setSuggestAddressInput(prevState => ({...prevState, [nodeIndex] : "Type here (e.g. 0x0100)"}));
        setInputPublishAddressValue(prevState => ({...prevState, [nodeIndex] : "0x0100"}));
        break;
      case "3":
        setSuggestAddressInput(prevState => ({...prevState, [nodeIndex] : "Type here (W.I.P)"}));
        setInputPublishAddressValue(prevState => ({...prevState, [nodeIndex] : ""}));
        break;
    }
    setAllowAddressInput(prevState => ({...prevState, [nodeIndex] : true}));
  };

  const key = `config?query=NODES`;
  const { data, error, isLoading } = useSWR(key, fetcherGET, {
    refreshInterval: 0,
  });
  if (error) return <div></div>;
  if (isLoading)
    return (
      <div>
        loading <span className="loading loading-spinner text-primary"></span>
      </div>
    );

  let obj: nodeObject;
  obj = data["NODES"];

  const compositionTitles = ["Company ID", "Product ID", "Version ID"];
  const compositionIndexes = ["cidName", "pid", "vid", "crpl"];
  const nonceTitles = ["Initialisation Vector Index", "Sequence Number"];
  const nonceIndexes = ["IVindex", "sequenceNumber"];
  const addressTypes = [
    "everyone",
    "group address",
    "unicast address",
    "virtual address",
  ];

  let renderedElements;

  if ("nodes" in obj && obj.nodes.length > 0) {
    renderedElements = obj.nodes.map((node, nodeIndex) => (
      <div
        key={node.deviceKey}
        className={"bg-base-100 join join-vertical md:m-2 md:mr-0 rounded-none md:rounded-xl flex md:inline-block"}
      >
        <div
          className="join-item text-center mt-1 font-bold text-lg"
          data-tooltip-id={`node-${nodeIndex}`}
          data-ripple-light="true"
        >
          Node {node.configuration.elements[0].unicastAddress || nodeIndex+1}
        </div>
        {/* Add useful icons based on models*/}
        <Tooltip id={`node-${nodeIndex}`}>
          <div>{node.deviceKey}</div>
        </Tooltip>

        <div className="join-item ">
          <div className="overflow-x-auto">
            <table className="table border-b border-base-200">
              <thead>
                <tr></tr>
                <tr></tr>
              </thead>
              <tbody>
                {compositionTitles.map((title, titleIndex) => (
                  <tr className="hover" key={`composition-${title}-${nodeIndex}`}>
                    <th>{title}</th>
                    <td>
                      <TooltipElement
                        tooltipText={tooltipText[title as keyof typeof tooltipText]}
                        label={node.composition[compositionIndexes[titleIndex] as keyof typeof node.composition].toString()}
                        labelStyle="flex items-center"
                        tooltipID={`node-${nodeIndex}-${title}`}
                      ></TooltipElement>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="join-item flex border-b border-base-200 justify-center items-center">
            <div className="stats ">
              {Object.entries(node.composition.features).map(([key, value]) => (
                <div
                  className="stat hover:bg-base-200"
                  data-tooltip-id={`node-${nodeIndex}-${key}`}
                  key={`stat-${key}-${nodeIndex}`}
                >
                  <div className="stat-value text-sm">{key}</div>
                  <Tooltip id={`node-${nodeIndex}-${key}`}>
                    <div>{tooltipText[key as keyof typeof tooltipText]}</div>
                  </Tooltip>
                  <div className="stat-desc">
                    {value ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-600">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="join-item mt-2 border-base-200">
            <TooltipElement
              tooltipText={tooltipText.nonce}
              label="Nonce"
              labelStyle=" font-bold mb-2 border-base-200 flex items-center justify-center"
              tooltipID={`node-${nodeIndex}-nonce`}
            ></TooltipElement>
            <table className="table border-t-2 border-base-200">
              <thead></thead>
              <tbody>
                {nonceTitles.map((nonceTitle, nonceIndex) => (
                  <tr className="hover" key={nonceIndex}>
                    <th>{nonceTitle}</th>
                    <td>
                      <TooltipElement
                        tooltipText={tooltipText[nonceIndexes[nonceIndex] as keyof typeof tooltipText]}
                        label={String(node[nonceIndexes[nonceIndex] as keyof typeof node])}
                        labelStyle="flex items-center"
                        tooltipID={`node-${nodeIndex}-${nonceTitle}`}
                      ></TooltipElement>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
            <input type="checkbox" className="peer" />
            <div
              className="collapse-title bg-base-100"
              data-tooltip-id={`node-${nodeIndex}-netkey`}
              data-ripple-light="true"
            >
              Network Keys
            </div>
            <div className="collapse-content  bg-base-100 ">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Index</th>
                      <th>Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {node.configuration.netKeys.map((netKey, keyIndex) => (
                      <tr className="hover" key={keyIndex}>
                        <th>{keyIndex + 1}</th>
                        <td>{netKey}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Tooltip id={`node-${nodeIndex}-netkey`}>
                  <div>
                    NetKey enables decryption and authentication up to the
                    Network Layer
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
            <input type="checkbox" className="peer" />
            <div className="collapse-title bg-base-100">Available Elements</div>
            <div className="collapse-content  bg-base-100 ">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Element Address</th>
                      <th>Location</th>
                      <th>Model(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {node.composition.elements.map((element, elementIndex) => (
                      <tr className="hover" key={`available-elements-${element.location}-${nodeIndex}`}>
                        <th>
                          {
                            node.configuration.elements[elementIndex]
                              .unicastAddress
                          }
                        </th>
                        <td>{element.location}</td>
                        <td>
                          {node.composition.elements[elementIndex].models.map(
                            (model, modelIndex) => (
                              <span key={`available-elements-${element.location}-${model}-${nodeIndex}`}>
                                {model}{" "}
                                {element.model_names && (
                                  <span>
                                    ({element.model_names[modelIndex]})
                                  </span>
                                )}
                                <br></br>
                              </span>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
            <input type="checkbox" className="peer" />
            <div className="collapse-title bg-base-100">Bind Configuration</div>
            <div className="collapse-content bg-base-100">
              <div className="divide-y divide-base-300">
                <div className="inline-flex space-x-2 items-center w-full py-2">
                  <div>Bind</div>
                  <select
                    className="select max-w-xs"
                    onChange={(e) =>
                      setSelectedBindElementIndex(prevState => ({...prevState, [nodeIndex] : parseInt(e.target.value)}))
                    }
                  >
                    <option disabled selected>
                      element
                    </option>
                    {node.configuration.elements.map(
                      (element, elementIndex) => (
                        <option key={elementIndex} value={elementIndex}>
                          element {element.unicastAddress}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    className="select max-w-xs"
                    onChange={(e) => setSelectedBindModelValue(prevState => ({...prevState, [nodeIndex] : e.target.value}))}
                  >
                    <option disabled selected>
                      model
                    </option>
                    {selectedBindElementIndex[nodeIndex] >= 0 &&
                      node.composition.elements[
                        selectedBindElementIndex[nodeIndex]
                      ].models.map((model, modelIndex) => (
                        <option key={modelIndex} value={model}>
                          model {model}
                        </option>
                      ))}
                  </select>
                  <br></br>
                </div>
                <div className="space-x-2 items-center w-full py-2">
                  <div className="inline">To</div>
                  <select
                    className="select max-w-xs"
                    onChange={(e) => setSelectedBindAppKeyIndex(prevState => ({...prevState, [nodeIndex] : parseInt(e.target.value)}))}
                  >
                    <option disabled selected>
                      application key
                    </option>
                    {obj.appKeys.map((appKey, index) => (
                      <option key={appKey.index} value={appKey.index}>
                        application key {appKey.index}: {appKey.key}
                      </option>
                    ))}
                  </select>
                  <button className="btn bg-transparent">
                    <Link href="/keys">Edit</Link>
                  </button>
                  </div>
                  <div className="flex justify-center items-center w-full py-2">
                    {selectedBindElementIndex[nodeIndex] >= 0 && 
                    selectedBindModelValue[nodeIndex] != "" &&
                    selectedBindAppKeyIndex[nodeIndex] >= 0 &&
                     (
                      <RegularButton
                        style="btn bg-base-100 w-full border border-base-300"
                        apiUrl="config"
                        requestData={{"add_bind":{
                          unicastAddress: node.configuration.elements[
                            selectedBindElementIndex[nodeIndex]
                          ]
                            ? node.configuration.elements[
                                0
                              ].unicastAddress
                            : "",
                          elementIndex: selectedBindElementIndex[nodeIndex],
                          appKeyIndex: selectedBindAppKeyIndex[nodeIndex],
                          modelValue: selectedBindModelValue[nodeIndex],
                          cid: node.composition.cid,
                        }}}
                        text="Bind"
                        uniqueId={`node${nodeIndex}`}
                      />
                    )}
                  </div>
              </div>
            </div>
          </div>
          <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
            <input type="checkbox" className="peer" />
            <div className="collapse-title bg-base-100">
              Subscribe & Publish Configuration
            </div>
            <div className="collapse-content">
              <div className="divide-y divide-base-300">
                <div className="inline-flex space-x-2 items-center w-full py-2">
                  <div>
                  Select
                  </div>
                  <select
                    className="select max-w-xs"
                    onChange={(e) =>
                      setSelectedPublishElementIndex(prevState => ({...prevState, [nodeIndex] : parseInt(e.target.value)}))
                    }
                  >
                    <option disabled selected>
                      element
                    </option>
                    {node.configuration.elements.map(
                      (element, elementIndex) => (
                        <option key={elementIndex} value={elementIndex}>
                          element {element.unicastAddress}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    className="select max-w-xs"
                    onChange={(e) =>
                      setSelectedPublishModelValue(prevState => ({...prevState, [nodeIndex] : e.target.value}))
                    }
                  >
                    <option disabled selected>
                      model
                    </option>
                    {/* selectedElementIndex < node.composition.elements.length prevents crash that happens when on any node selected element has more models that the one on any other node, ideally every node should have separate selectedIndex*/}
                    {selectedPublishElementIndex[nodeIndex] >= 0 &&
                      node.composition.elements[
                        selectedPublishElementIndex[nodeIndex]
                      ].models.map((model, modelIndex) => (
                        <option key={modelIndex} value={model}>
                          model {model}
                        </option>
                      ))}
                  </select>
                </div>
                <br></br>
                <div className="inline-flex space-x-2 items-center w-full py-2">
                  <div>
                  To
                  </div>
                  <select
                    className="select max-w-xs"
                    onChange={(e) => handleAddressSelection(e, nodeIndex)}
                  >
                    <option disabled selected>
                      Address
                    </option>
                    {addressTypes.map((element, elementIndex) => (
                      <option key={elementIndex} value={elementIndex}>
                        {element}
                      </option>
                    ))}
                  </select>
                  <TooltipElement
                    tooltipText={<span dangerouslySetInnerHTML={{ __html: tooltipText["subscribePublishAddress"] }} />}
                    label=""
                    tooltipID={`node-${nodeIndex}-subscribe-publish-address`}
                    labelStyle="flex items-center"
                  ></TooltipElement>
                  {allowAddressInput[nodeIndex] && (
                    <input
                      type="text"
                      value={inputPublishAddressValue[nodeIndex]}
                      onChange={(e) =>
                        setInputPublishAddressValue(prevState => ({...prevState, [nodeIndex] : e.target.value}))
                      }
                      placeholder={suggestAddressInput[nodeIndex]}
                      className="input flex-grow"
                    />
                  )}
                </div>
                <br></br>
                <div className="inline-flex space-x-2 items-center w-full py-2">
                  <div>
                  Set
                  </div>
                  <input
                    type="text"
                    onChange={(e) =>
                      setInputPublishPublicationPeriod(prevState => ({...prevState, [nodeIndex] : parseInt(e.target.value)}))
                    }
                    placeholder="publication period (default is 0)"
                    className="input w-full max-w-xs inline"
                  />
                </div>
                <br></br>
                <div className="inline-flex space-x-2 items-center w-full py-2">
                  <div>and</div>
                  <input
                    type="text"
                    onChange={(e) =>
                      setInputPublishRetransmissionCount(prevState => ({...prevState, [nodeIndex] : parseInt(e.target.value)}))
                    }
                    placeholder="retransmission count (default is 0)"
                    className="input w-full max-w-xs"
                  />
                </div>
                <div className="space-x-2 items-center py-2">
                  <div className="inline">
                    Use
                  </div>
                  <select
                    className="select max-w-xs"
                    onChange={(e) =>
                      setSelectedPublishAppKeyIndex(prevState => ({...prevState, [nodeIndex] : parseInt(e.target.value)}))
                    }
                  >
                    <option disabled selected>
                      application key
                    </option>
                    {obj.appKeys.map((appKey, index) => (
                      <option key={appKey.index} value={appKey.index}>
                        application key {appKey.index}: {appKey.key}
                      </option>
                    ))}
                  </select>
                  <button className="btn bg-transparent">
                    <Link href="/keys">Edit</Link>
                  </button>
                </div>
                <div className="flex justify-center items-center w-full py-2">
                  {selectedPublishElementIndex[nodeIndex] >= 0 &&
                  selectedPublishModelValue[nodeIndex] != "" &&
                  inputPublishAddressValue[nodeIndex] != "" &&
                  selectedPublishAppKeyIndex[nodeIndex] >= 0 && (
                    <div className="flex w-full space-x-2">
                      <RegularButton
                        style="btn bg-base-100 w-full border border-base-300"
                        apiUrl="config"
                        requestData={{
                          "sub_add":{
                          unicastAddress: node.configuration.elements[
                            selectedPublishElementIndex[nodeIndex]
                          ]
                            ? node.configuration.elements[
                                0
                              ].unicastAddress
                            : "",
                            elementAddress: node.configuration.elements[selectedPublishElementIndex[nodeIndex] || 0].unicastAddress,
                          address: inputPublishAddressValue[nodeIndex],
                          appKeyIndex: selectedPublishAppKeyIndex[nodeIndex],
                          modelValue: selectedPublishModelValue[nodeIndex],
                          cid: node.composition.cid,
                          
                        }}}
                        text="Subscribe"
                        uniqueId={`node${nodeIndex}`}
                      />
                      <RegularButton
                        style="btn bg-base-100 w-full border border-base-300"
                        apiUrl="config"
                        requestData={{
                          "pub_set":{
                          unicastAddress: node.configuration.elements[
                            selectedPublishElementIndex[nodeIndex]
                          ]
                            ? node.configuration.elements[
                                0
                              ].unicastAddress
                            : "",
                          elementAddress: node.configuration.elements[selectedPublishElementIndex[nodeIndex] || 0].unicastAddress,
                          address: inputPublishAddressValue[nodeIndex],
                          appKeyIndex: selectedPublishAppKeyIndex[nodeIndex],
                          publicationPeriod: inputPublishPublicationPeriod[nodeIndex] || 0,
                          retransmissionCount: inputPublishRetransmissionCount[nodeIndex] || 0,
                          modelValue: selectedPublishModelValue[nodeIndex],
                          cid: node.composition.cid,
                        }}}
                        text="Publish"
                        uniqueId={`node${nodeIndex}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="join-item inline-block">
              <RegularButton
                apiUrl={`config?address=${node.configuration.elements[0].unicastAddress}`}
                text="Reset node"
                style="btn btn-outline btn-error bg-transparent w-full rounded-none md:rounded-xl"
                uniqueId={`node${nodeIndex}`}
              ></RegularButton>
            </div>
          </div>
        </div>
      </div>
    ));
  }
  return (
    <div className="mb-16">{renderedElements ? renderedElements : <NoProvisionedNodes />}</div>
  );
};

export default NodesElement;
