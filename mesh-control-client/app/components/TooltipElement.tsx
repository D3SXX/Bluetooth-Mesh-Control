import React, { useDebugValue } from "react";
import Image from "next/image";
import { Tooltip } from "react-tooltip";

import useIsDarkMode from "../helpers/isDarkMode";

const TooltipElement = ({
  tooltipText,
  label,
  labelStyle,
  tooltipID,
}: {
  tooltipText: string | React.ReactNode;
  label: string;
  labelStyle: string;
  tooltipID: string;
}) => {
  const isDarkMode = useIsDarkMode();
  return (
    <div className={labelStyle}>
      {label}
      <div className="ml-1 flex items-center justify-center relative">
        <Image
          data-tooltip-id={tooltipID}
          data-ripple-light="true"
          src="/icons/info.svg"
          width={20}
          height={20}
          alt={" (?)"}
          className={`ml-1 rounded-full animate-resize ${isDarkMode ? "filter-invert-dark" : "filter-invert-not-selected"}`}
        />
      </div>
      <Tooltip id={tooltipID} className="font-normal">
        <div>{tooltipText}</div>
      </Tooltip>
    </div>
  );
};

export default TooltipElement;
