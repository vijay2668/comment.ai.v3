//Tooltip.js
import React, { useState } from "react";

export function Tooltip({ content, children }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex cursor-pointer items-center"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="pointer-events-none absolute whitespace-nowrap bottom-full left-1/3 z-50 -translate-x-1/2 transform rounded-md bg-gray-800 px-2 py-1 text-white transition-all duration-300">
          {content}
        </div>
      )}
    </div>
  );
}
