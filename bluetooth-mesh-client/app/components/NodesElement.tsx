"use client"
import React, { useState } from 'react';
import useSWR from 'swr'
import { Tooltip } from 'react-tooltip'
import TooltipElement from './TooltipElement';
import Link from 'next/link';
import RegularButton from './RegularButton';
import NoProvisionedNodes from './NoProvisionedNodes';

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
        }
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
  proxy: "Ability to receive and retransmit Messages between GATT and advertising bearers",
  friend: "Ability to help a Node supporting the Low Power feature to operate efficiently",
  lpn: "Ability to operate with reduced receiver duty cycles in a mesh network by working with a Friend node",
  nonce: "A nonce is a unique number used once to prevent replay attacks in communications security.",
  IVindex: "The IV Index is a 32-bit value which is shared by all Nodes in a network",
  sequenceNumber: "The sequence number is a unique identifier for messages that ensures proper sequencing and dublicate prevention",
  networkKey: "",
  element: "",
  elementAddress: "",
  Location: "",
  Model: "",
  bind: "",
  bindFirstRow: "",
  bindSecondRow: "",
  publish: "",
  publishFirstRow: "",
  publishSecondRow: "",
  publishThirdRow: ""
}

// Many descriptions are taken from https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/mesh/mesh-glossary/

const NodesElement = () => {
  // For binding (bind <ele_idx> <app_idx> <mod_id> [cid])
  const [selectedBindElementIndex, setSelectedBindElementIndex] = useState(-1);
  const [selectedBindAppKeyIndex, setSelectedBindAppKeyIndex] = useState(null);
  const [selectedBindModelValue, setSelectedBindModelValue] = useState(null);

  // For publishing (pub-set <ele_addr> <pub_addr> <app_idx> <per (step|res)> <re-xmt (cnt|per)> <mod id> [cid])
  const [selectedPublishElementIndex, setSelectedPublishElementIndex] = useState(null);
  const [inputPublishAddressValue, setInputPublishAddressValue] = useState(null);
  const [selectedPublishAppKeyIndex, setSelectedPublishAppKeyIndex] = useState(null);
  const [inputPublishPublicationPeriod, setInputPublishPublicationPeriod] = useState(0);
  const [inputPublishRetransmissionCount, setInputPublishRetransmissionCount] = useState(0);
  const [selectedPublishModelValue, setSelectedPublishModelValue] = useState(null);

  //const [resetNodeState, setResetNodeState] = useState(false);
  const [allowAddressInput, setAllowAddressInput] = useState(false);
  const [suggestAddressInput, setSuggestAddressInput] = useState("Type here...");
  const fetcher = (request: string) => async (url: string) => {
    const apiUrl = `http://127.0.0.1:10000${url}`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return res.text();
  };

  const handleAddressSelection = (e) => {
    console.log(addressTypes[e.target.value], e.target.value)
    switch (e.target.value) {
      case "0":
        setAllowAddressInput(false);
        setInputPublishAddressValue("0xFFFF")
        return;
      case "1":
        setSuggestAddressInput("Type here (e.g. 0xC000)");
        setInputPublishAddressValue("0xC000")
        break;
      case "2":
        setSuggestAddressInput("Type here (e.g. 0x0100)");
        setInputPublishAddressValue("0x0100")
        break;
      case "3":
        setSuggestAddressInput("Type here (W.I.P.)");
        setInputPublishAddressValue("")
        break;

    }
    setAllowAddressInput(true)

  };

  const key = `/api/data/get-nodes-info`;
  const { data, error, isLoading } = useSWR(key, fetcher("get-nodes-info"), { refreshInterval: 0 });
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let obj: nodeObject;
  try {
    obj = JSON.parse(data);
  }
  catch {
    return <div>Failed to load</div>
  }
  console.log(obj)
  const compositionTitles = ["Company ID", "Product ID", "Version ID"];
  const compositionIndexes = ["cidName", "pid", "vid", "crpl"];
  const nonceTitles = ["Initialisation Vector Index", "Sequence Number"];
  const nonceIndexes = ["IVindex", "sequenceNumber"]
  const addressTypes = ['everyone', 'group address', 'unicast address', 'virtual address'];

  let renderedElements;

  if ("nodes" in obj && obj.nodes.length > 0){
  renderedElements = obj.nodes.map((node, nodeIndex) => (
    <div key={node.deviceKey} className='bg-base-100 join join-vertical me-2 mb-2'>
      <div className='join-item text-center mt-1 font-bold border-b-2 text-lg' data-tooltip-id={`tooltip-nodeid-${nodeIndex}`} data-ripple-light="true">Node {nodeIndex + 1}</div>
      {/* Add useful icons based on models*/}
      <Tooltip id={`tooltip-nodeid-${nodeIndex}`}>
        <div>{node.deviceKey}</div>
      </Tooltip>

      <div className='join-item '>
        <div className="overflow-x-auto">
          <table className="table border-b border-base-200">
            <thead>
              <tr></tr>
              <tr></tr>
            </thead>
            <tbody>
              {compositionTitles.map((title, titleIndex) => (
                <tr className='hover'>
                  <th>{title}</th>
                  <td><TooltipElement tooltipText={tooltipText[title]} label={node.composition[compositionIndexes[titleIndex]]} labelStyle="flex" tooltipID={title}></TooltipElement></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='join-item flex border-b border-base-200 justify-center items-center'>
          <div className='stats '>
            {Object.entries(node.composition.features).map(([key, value]) => (
              <div className='stat hover:bg-zinc-100' data-tooltip-id={`tooltip-${key}-${nodeIndex}`}>
                <div className='stat-value text-sm'>
                  {key}
                </div>
                <Tooltip id={`tooltip-${key}-${nodeIndex}`}>
                  <div>{tooltipText[key]}</div>
                </Tooltip>
                <div className='stat-desc'>
                  {value ? (<span className='text-green-600'>Available</span>) : (<span className='text-red-600'>Unavailable</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='join-item mt-2 border-base-200'>
          <TooltipElement tooltipText={tooltipText.nonce} label="Nonce" labelStyle=" font-bold mb-2 border-base-200 flex items-center justify-center" tooltipID="nonce"></TooltipElement>
          <table className='table border-t-2 border-base-200'>
            <thead>
            </thead>
            <tbody>
              {nonceTitles.map((nonceTitle, nonceIndex) => (
                <tr className='hover' key={nonceIndex}>
                  <th>{nonceTitle}</th>
                  <td><TooltipElement tooltipText={tooltipText[nonceIndexes[nonceIndex]]} label={node[nonceIndexes[nonceIndex]]} labelStyle="flex " tooltipID={nonceTitle}></TooltipElement></td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
        <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title bg-base-100" data-tooltip-id={`tooltip-netkey`} data-ripple-light="true">
            Network Keys
          </div>
          <div className='collapse-content  bg-base-100 '>
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
                    <tr className='hover' key={keyIndex}>
                      <th>{keyIndex + 1}</th>
                      <td>{netKey}</td>

                    </tr>

                  ))}
                </tbody>
              </table>
              <Tooltip id={`tooltip-netkey`}>
                <div>NetKey enables decryption and authentication up to the Network Layer</div>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title bg-base-100">
            Available Elements
          </div>
          <div className='collapse-content  bg-base-100 '>
            <div className="overflow-x-auto">
              <table className="table ">
                <thead>
                  <tr>
                    <th>Element Address</th>
                    <th>Location</th>
                    <th>Model(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {node.composition.elements.map((element, elementIndex) => (
                    <tr className='hover'>
                      <th>{node.configuration.elements[elementIndex].unicastAddress}</th>
                      <td>{element.location}</td>
                      <td>
                        {node.composition.elements[elementIndex].models.map((model, modelIndex) =>
                          <span>{model} {element.model_names && (
                            <span>({element.model_names[modelIndex]})</span>
                          )}<br></br></span>)}
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
          <div className="collapse-title bg-base-100">
            Bind Configuration
          </div>
          <div className='collapse-content'>
            <div><div className='mb-2'>Bind                 <select className="select max-w-xs"
              onChange={(e) => setSelectedBindElementIndex(parseInt(e.target.value))}>
              <option disabled selected>element</option>
              {node.configuration.elements.map((element, elementIndex) => (
                <option key={elementIndex} value={elementIndex}>element {element.unicastAddress}</option>
              ))}
            </select>
              <select className="select max-w-xs" onChange={(e) => setSelectedBindModelValue(e.target.value)}>
                <option disabled selected>model</option>
                {/* selectedElementIndex < node.composition.elements.length prevents crash that happens when on any node selected element has more models that the one on any other node, ideally every node should have separate selectedIndex*/}
                {(selectedBindElementIndex > -1 && selectedBindElementIndex < node.composition.elements.length) && node.composition.elements[selectedBindElementIndex].models.map((model, modelIndex) => (
                  <option key={modelIndex} value={model}>model {model}</option>
                ))}
              </select><br></br>
            </div>
              <div className=' border-t border-base-300 '>
                To <select className="select max-w-xs" onChange={(e) => setSelectedBindAppKeyIndex(e.target.value)}>
                  <option disabled selected>application key</option>
                  {obj.appKeys.map((appKey, index) => (
                    <option key={appKey.index} value={appKey.index}>application key {appKey.index}: {appKey.key}</option>
                  ))}
                </select>

                <button className="btn bg-transparent ml-1 mt-2 mb-2"><Link href="/keys">Edit</Link></button>
                <div className="inline-flex">
                  {selectedBindElementIndex > -1 && <RegularButton command='add-bind' requestData={JSON.stringify({ "unicastAddress": node.configuration.elements[selectedBindElementIndex].unicastAddress, "elementIndex": selectedBindElementIndex, "appKeyIndex": selectedBindAppKeyIndex, "modelValue": selectedBindModelValue, "cid": node.composition.cid })} text='Bind' />}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="join-item collapse collapse-arrow border-t-2 border-base-300">
          <input type="checkbox" className="peer" />
          <div className="collapse-title bg-base-100">
            Subscribe & Publish Configuration
          </div>
          <div className='collapse-content'>
            <div><div>Publish                 <select className="select max-w-xs"
              onChange={(e) => setSelectedPublishElementIndex(e.target.value)}>
              <option disabled selected>element</option>
              {node.configuration.elements.map((element, elementIndex) => (
                <option key={elementIndex} value={elementIndex}>element {element.unicastAddress}</option>
              ))}
            </select>
              <select className="select max-w-xs" onChange={(e) => setSelectedPublishModelValue(e.target.value)}>
                <option disabled selected>model</option>
                {/* selectedElementIndex < node.composition.elements.length prevents crash that happens when on any node selected element has more models that the one on any other node, ideally every node should have separate selectedIndex*/}
                {selectedPublishElementIndex && selectedPublishElementIndex < node.composition.elements.length && node.composition.elements[selectedPublishElementIndex].models.map((model, modelIndex) => (
                  <option key={modelIndex} value={model}>model {model}</option>
                ))}
              </select><br></br></div>
              <div className='inline-flex items-center mb-2 mt-2 border-b border-t border-base-300'>
                To
                <select className="select max-w-xs " onChange={handleAddressSelection}>
                  <option disabled selected>Address</option>
                  {addressTypes.map((element, elementIndex) => (
                    <option key={elementIndex} value={elementIndex}>{element}</option>
                  ))}
                </select>
                {allowAddressInput && <input type="text" value={inputPublishAddressValue} onChange={(e) => setInputPublishAddressValue(e.target.value)} placeholder={suggestAddressInput} className="input w-full max-w-xs " />}
                <TooltipElement label="" tooltipID="publish-info-2"></TooltipElement>
              </div>
              <br></br>
              <div>
                Set <input type="text" onChange={(e) => setInputPublishPublicationPeriod(e.target.value)} placeholder="publication period (default is 0)" className="input w-full max-w-xs" />
              </div>
              <div className='mb-2 mt-2 border-b border-t border-base-300'>
                and <input type="text" onChange={(e) => setInputPublishRetransmissionCount(e.target.value)} placeholder="retransmission count (default is 0)" className="input w-full max-w-xs" />
              </div>
              <div>
                Use <select className="select max-w-xs" onChange={(e) => setSelectedPublishAppKeyIndex(e.target.value)}>
                  <option disabled selected>application key</option>
                  {obj.appKeys.map((appKey, index) => (
                    <option key={appKey.index} value={appKey.index}>application key {appKey.index}: {appKey.key}</option>
                  ))}
                </select>
                <button className="btn bg-transparent ml-1"><Link href="/keys">Edit</Link></button>
              </div>
              <div className='flex justify-center items-center'>
                <div className="inline-flex mt-2 mb-2">
                  {selectedPublishModelValue && <RegularButton command='add-sub' requestData={JSON.stringify({ "unicastAddress": node.configuration.elements[selectedPublishElementIndex].unicastAddress, "address": inputPublishAddressValue, "appKeyIndex": selectedPublishAppKeyIndex, "modelValue": selectedPublishModelValue, "cid": node.composition.cid })} text='Subscribe' />}
                  {selectedPublishModelValue && <RegularButton command='add-pub' requestData={JSON.stringify({ "unicastAddress": node.configuration.elements[selectedPublishElementIndex].unicastAddress, "address": inputPublishAddressValue, "appKeyIndex": selectedPublishAppKeyIndex, "publicationPeriod": inputPublishPublicationPeriod, "retransmissionCount": inputPublishRetransmissionCount, "modelValue": selectedPublishModelValue, "cid": node.composition.cid })} text='Publish' />}
                </div>
              </div>
            </div>
          </div>
          <div className='join-item inline-block'>
            <RegularButton command="reset-node" requestData={JSON.stringify({ "unicastAddress": node.configuration.elements[0].unicastAddress, "type": "unicastAddress" })} text="Reset node" style="btn btn-outline btn-error bg-transparent w-full" timeout={30}></RegularButton>
          </div>
        </div>

      </div>



    </div>
  ));
}
console.log(renderedElements)
  return (
    <div>
    {renderedElements ? renderedElements : <NoProvisionedNodes />}
  </div>
  )
}

export default NodesElement
