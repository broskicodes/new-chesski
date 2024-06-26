import React, { JSX, useState, useRef, useEffect } from "react";
import tippy, { Instance } from "tippy.js";
import "tippy.js/dist/tippy.css";

interface TooltipProps {
  content: string;
  children: JSX.Element;
  className?: string;
}

export const Tooltip = ({ content, children, className }: TooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<Instance | null>(null);

  useEffect(() => {
    if (tooltipRef.current) {
      if (!instance) {
        setInstance(
          tippy(tooltipRef.current, {
            content: content,
            arrow: true,
            placement: "bottom",
          }),
        );
      } else {
        instance.setContent(content);
      }
    }
  }, [content, instance]);

  return (
    <div className={className} ref={tooltipRef}>
      {children}
      <div className="hidden">{content}</div>
    </div>
  );
};
