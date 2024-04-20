import React from 'react'
import NavBar from "@/app/components/NavBar";
import NodesElement from '../components/NodesElement';
import KeysElement from '../components/KeysElement';


const KeysPage = () => {

  return (
    <div>
     <NavBar></NavBar>
     <div className='ml-2 mt-2'>
    <KeysElement></KeysElement>
    </div>
    </div>
  )
}

export default KeysPage