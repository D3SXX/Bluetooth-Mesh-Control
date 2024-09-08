"use client"
import React, { useState } from 'react';
import useSWR from 'swr'
import { Tooltip } from 'react-tooltip'
import TooltipElement from './TooltipElement';
import RegularButton from './RegularButton';
import Toast from './Toast';
import { json } from 'stream/consumers';
import NoProvisionedNodes from './NoProvisionedNodes';

interface DataInterface {
  $schema: string;
  meshName: string;
  netKeys: {
    index: number;
    keyRefresh: number;
    key: string;
  }[];
  appKeys: {
    index: number;
    boundNetKey: number;
    key: string;
  }[];
  provisioners: {
    provisionerName: string;
    unicastAddress: string;
    allocatedUnicastRange: {
      lowAddress: string;
      highAddress: string;
    }[];
  }[];
  nodes: {
    deviceKey: string;
    configuration: {
      netKeys: string[];
      elements: {
        elementIndex: number;
        unicastAddress: string;
        models?: {
          modelId: string;
          bind?: number[];
          publish?: {
            address: string;
            index: string;
            ttl: number;
          };
        }[];
      }[];
      appKeys?: string[];
    };
    composition: {
      cid: string;
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
      }[];
    };
    IVindex: number;
    sequenceNumber: number;
  }[];
  IVindex: number;
  IVupdate: number;
}

const KeysElement = () => {

  const [appKeyModalSelected, setappKeyModalSelected] = useState(1);
  const [selectedAppKeyEdit,setSelectedAppKeyEdit] = useState(null)
  const [selectedBoundNetKeyEdit, setSelectedBoundNetKeyEdit] = useState(null)
  const [selectedNetKeyBound,setSelectedNetKeyBound] = useState(null)
  const [selectedAppKeyRemove,setSelectedAppKeyRemove] = useState(null)
  const [inputAppKeyAddValue, setInputAppKeyAddValue] = useState('');
  const [inputAppKeyEditValue, setInputAppKeyEditValue] = useState('');

  const handleAddAppKeyValueChange = (event: { target: { value: React.SetStateAction<string>; }; }) =>{
    setInputAppKeyAddValue(event.target.value);
  }

  const handleEditAppKeyValueChange = (event: { target: { value: React.SetStateAction<string>; }; }) =>{
    setInputAppKeyEditValue(event.target.value);
  }

  const handleappKeyModal = (option: React.SetStateAction<number>) => {
    setappKeyModalSelected(option);
    const contentFirst = document.getElementById(`appKeyConfigContent-1`);
    const contentSecond = document.getElementById(`appKeyConfigContent-2`);
    const contentThird = document.getElementById(`appKeyConfigContent-3`);
    switch(option){
      case 1:
       contentFirst?.classList.remove("hidden")
       contentSecond?.classList.add("hidden")
       contentThird?.classList.add("hidden")
        break;
      case 2:
        contentFirst?.classList.add("hidden")
        contentSecond?.classList.remove("hidden")
        contentThird?.classList.add("hidden")
        break;
      case 3:
        contentFirst?.classList.add("hidden")
        contentSecond?.classList.add("hidden")
        contentThird?.classList.remove("hidden")
        break;
    }
    
  };

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

  const key = `/api/data/get-keys-data`;
  const { data, error, isLoading } = useSWR(key, fetcher("get-keys-data"), { refreshInterval: 0 });
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading <span className="loading loading-spinner text-primary"></span></div>
  let obj: DataInterface;
  try{
    obj = JSON.parse(data);
  }
  catch{
    return <div>Failed to load, try to add new nodes..</div>
  }

  let renderedElements;

  if ("appKeys" in obj){
    renderedElements = (<div className='w-full'>
      <div key={1} className='bg-base-100 join join-vertical me-2 mb-2 '>
        <div className='join-item text-center mt-1 mb-1 font-bold border-b-2 text-lg'>Application Keys</div>
        <div className="join-item collapse collapse-arrow border border-t-0 border-base-300 ">
          <input type="checkbox" className="peer" />
          <div className="collapse-title bg-base-100">
            Available Keys
          </div>
          <div className='collapse-content'>
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
                  {obj.appKeys.map((appKey, index) => (
                    <tr className='hover' key={index}>
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
          <div className="collapse-title bg-base-100" data-tooltip-id={`tooltip-netkey`} data-ripple-light="true">
            Assigned Keys
          </div>
          <div className='collapse-content bg-base-100'>
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
                  {obj.nodes.map((node, nodeIndex) => (
                    node.configuration.elements.map((element, elementIndex) => (
                      element.models && element.models.map((model, modelIndex) => (
                        <React.Fragment key={modelIndex}>
                          {model.bind && model.bind.map((keyIndex, bindIndex) => (
                            <tr className='hover' key={`bind_${nodeIndex}_${elementIndex}_${modelIndex}_${bindIndex}`}>
                              <th>{element.unicastAddress}</th>
                              <td>Bind</td>
                              <td>{model.modelId}</td>
                              <td>{keyIndex}</td>
                            </tr>
                          ))}
                          {model.publish && (
                            <tr className='hover' key={`publish_${nodeIndex}_${elementIndex}_${modelIndex}`}>
                              <th>{element.unicastAddress}</th>
                              <td>Publish</td>
                              <td>{model.modelId}</td>
                              <td>{model.publish.address}</td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className='join-item'><button className="btn bg-base-100 w-full" onClick={() => document.getElementById('appKeyConfigModal').showModal()}>Edit keys configuration</button>
          <dialog id="appKeyConfigModal" className="modal">
            <div className="modal-box min-h-56">
              <h3 className="font-bold text-lg"><ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box w-full">
  <li className={`m-auto ${appKeyModalSelected === 1 ? 'border-b-2 border-neutral-700' : ''}`} onClick={() => handleappKeyModal(1)}><a>Add a new key</a></li>
  <li className={`m-auto ${appKeyModalSelected === 2 ? 'border-b-2 border-neutral-700' : ''}`} onClick={() => handleappKeyModal(2)}><a>Edit a key</a></li>
  <li className={`m-auto ${appKeyModalSelected === 3 ? 'border-b-2 border-neutral-700' : ''}`} onClick={() => handleappKeyModal(3)}><a>Remove a key</a></li>
</ul></h3>
              <p className="py-4">
                <div id="appKeyConfigContent-1">
                <input type="text" placeholder="Type any key.." value={inputAppKeyAddValue} onChange={handleAddAppKeyValueChange} className="input input-bordered w-full max-w-xs" />
                <div className='flex items-center mt-2'>
                <select className="select select-bordered w-full max-w-xs inline" onChange={(e) => setSelectedNetKeyBound(e.target.value)}>
                <option disabled selected>Select any network key to bound..</option>
                {obj.netKeys && obj.netKeys.map((netKey,index) =>
                <option value={netKey.index}>Bound to key {netKey.index}: {netKey.key}</option>
              )}
              </select>
                <RegularButton command="add-appkey" requestData={JSON.stringify({"key":inputAppKeyAddValue,"boundNetKey":selectedNetKeyBound})} text='Add key'></RegularButton>
                </div>
              </div>
              <div id="appKeyConfigContent-2" className='hidden'>
              <select className="select select-bordered w-full max-w-xs"   onChange={(e) => {
                setSelectedAppKeyEdit(e.target.value);
                setInputAppKeyEditValue(obj.appKeys[e.target.value].key);
                setSelectedBoundNetKeyEdit(obj.appKeys[e.target.value].boundNetKey)
              }}>
                <option disabled selected>Select any key to edit..</option>
                {obj.appKeys && obj.appKeys.map((appKey,index) =>
                <option value={appKey.index}>Key index {appKey.index}: {appKey.key}</option>
              )}
              </select>
              {selectedAppKeyEdit && 
                <input type="text" placeholder="Type any key.." value={inputAppKeyEditValue} onChange={handleEditAppKeyValueChange} className="input input-bordered w-full max-w-xs mt-2" />
                
                 }
              {selectedAppKeyEdit && <div className='flex items-center mt-2'>
                <select className="select select-bordered w-full max-w-xs " onChange={(e) => setSelectedBoundNetKeyEdit(e.target.value)}>
                {obj.netKeys.map((key, index) => (
                            <option value={key.index} selected={key.index == obj.appKeys[selectedAppKeyEdit].boundNetKey}>Bound to key {key.index}: {key.key}</option>
                            
                    ))
                  }
                  </select>
                  <RegularButton command='edit-appkey' requestData={JSON.stringify({"index":selectedAppKeyEdit,"key":inputAppKeyEditValue,"boundNetKey":selectedBoundNetKeyEdit})} text='Edit key'></RegularButton>
                  </div>
                  }
              <div className='min-h-12'></div>
              </div>
              <div id="appKeyConfigContent-3" className='hidden'>
              <div className='flex items-center'>
              <select className="select select-bordered w-full max-w-xs" onChange={(e) => setSelectedAppKeyRemove(e.target.value)}>
                <option disabled selected>Select any key to remove..</option>
                {obj.appKeys && obj.appKeys.map((appKey,index) =>
                <option value={appKey.key}>Key index {appKey.index}: {appKey.key}</option>
              )}
              </select>
              {selectedAppKeyRemove && <RegularButton command='remove-appkey' requestData={selectedAppKeyRemove} text='Remove key'></RegularButton>}
              </div></div>
              </p>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog></div>

      </div>
      <div key={2} className='bg-base-100 join join-vertical me-2 mb-2'>
        <div className='join-item text-center mt-1 mb-1 font-bold border-b-2 text-lg' data-tooltip-id={`tooltip-nodeid-${1}`} data-ripple-light="true">Network Keys</div>
        <div className="join-item collapse collapse-arrow border border-t-0 border-base-300 ">
          <input type="checkbox" className="peer" />
          <div className="collapse-title bg-base-100">
            Available Keys
          </div>
          <div className='collapse-content '>
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
                  {obj.netKeys.map((netKey, index) => (
                    <tr className='hover' key={index}>
                      <th>{netKey.index}</th>
                      <td>{Boolean(netKey.keyRefresh).toString()}</td>
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
          <div className="collapse-title bg-base-100" data-tooltip-id={`tooltip-netkey`} data-ripple-light="true">
            Assigned Keys
          </div>
          <div className='collapse-content'>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Node Index</th>
                    <th>Node Device Key</th>
                    <th>Key Index</th>
                  </tr>
                </thead>
                <tbody>
                  {obj.nodes.map((node, nodeIndex) => (
                    node.configuration.netKeys.map((key, index) => (
                            <tr className='hover' key={`Netkey_${nodeIndex}_${key}`}>
                              <th>{nodeIndex+1}</th>
                              <td>{node.deviceKey}</td>
                              <td>{parseInt(key,16)}</td>
                            </tr>
                      ))
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>)
  }

  return (
    <div>
    {renderedElements ? renderedElements : <NoProvisionedNodes />}
  </div>
  )
}

export default KeysElement
