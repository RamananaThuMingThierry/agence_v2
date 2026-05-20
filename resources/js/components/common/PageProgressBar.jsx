import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageProgress } from "../../hooks/progress/PageProgressContext";

export default function PageProgressBar() {
  const location = useLocation();
  const { progress, visible, start, done } = usePageProgress();

  useEffect(() => {
    start();

    const timeoutId = window.setTimeout(() => {
      done();
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
      done();
    };
  }, [location.pathname, location.search]);

  return (
    <div
      aria-hidden="true"
      className={visible ? "pointer-events-none fixed left-0 right-0 top-0 z-[120] opacity-100 transition-opacity duration-300" : "pointer-events-none fixed left-0 right-0 top-0 z-[120] opacity-0 transition-opacity duration-300"}
    >
      <div className="h-[2px] w-full bg-transparent">
        <div
          className="relative h-full rounded-r-full bg-[linear-gradient(90deg,#f0c96a,#f5d089,#fff1bf)] shadow-[0_0_12px_rgba(245,208,137,0.22)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute right-0 top-1/2 h-2.5 w-10 -translate-y-1/2 rounded-full bg-[rgba(255,241,191,0.95)] blur-md" />
        </div>
      </div>
    </div>
  );
}
