import Link from 'next/link'
import React from 'react'

const NoProvisionedNodes = () => {
  return (
    <div className='collapse border-base-300 bg-base-100 border collapse-open'>
        <div className="collapse-title">
        Could not find any provisioned nodes...
        </div>
        <div className='collapse-content'>
        <Link className='btn bg-base-100' href={'/provision'}>Provision new nodes</Link>
        </div>
        </div>
  )
}

export default NoProvisionedNodes