import React from 'react'
import Image from 'next/image'
import { Tooltip } from 'react-tooltip'

const TooltipElement = ({tooltipText,label,labelStyle,tooltipID}) => {
  return (
    <div className={labelStyle}>
      {label}
      <Image data-tooltip-id={tooltipID} data-ripple-light="true" src='/icons/icons8-info.gif' width={22} height={22} alt={''}  className='ml-1'/>
      <Tooltip id={tooltipID}>
        <div>{tooltipText}</div>
      </Tooltip>
    </div>
      
  )
}

export default TooltipElement
