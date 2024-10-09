import React from 'react'
import Image from 'next/image'
import { Tooltip } from 'react-tooltip'

const TooltipElement = ({tooltipText,label,labelStyle,tooltipID} : {tooltipText:string | React.ReactNode, label:string,labelStyle:string, tooltipID:string}) => {
  return (
    <div className={labelStyle}>
      {label}
      <Image data-tooltip-id={tooltipID} data-ripple-light="true" src='/icons/info.svg' unoptimized={true} width={20} height={20} alt={' (?)'}  className='ml-1 rounded-full'/>
      <Tooltip id={tooltipID} className='font-normal'>
        <div>{tooltipText}</div>
      </Tooltip>
    </div>
      
  )
}

export default TooltipElement
