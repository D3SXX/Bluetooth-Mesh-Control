import React from 'react'
import NavBar from "@/app/components/NavBar";
import NodesElement from '../components/NodesElement';


const NodesPage = () => {

  return (
    <div>
     <NavBar></NavBar>
     <div className='m-2'><NodesElement></NodesElement></div>
    
    </div>
  )
}

export default NodesPage