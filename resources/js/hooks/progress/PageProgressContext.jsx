import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const PageProgressContext = createContext(null);
const START_VALUE = 8;
const MAX_AUTO_VALUE = 92;
const MIN_VISIBLE_MS = 280;

export function PageProgressProvider({ children }) {
  const [activeCount, setActiveCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const visibleSinceRef = useRef(0);
  const hideTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const requestId = axios.interceptors.request.use((config) => {
      setActiveCount((count) => count + 1);
      return config;
    });

    const finalize = (value) => {
      setActiveCount((count) => Math.max(0, count - 1));
      return value;
    };

    const responseId = axios.interceptors.response.use(
      (response) => finalize(response),
      (error) => Promise.reject(finalize(error)),
    );

    return () => {
      axios.interceptors.request.eject(requestId);
      axios.interceptors.response.eject(responseId);
    };
  }, []);

  useEffect(() => {
    if (activeCount > 0) {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      setVisible((current) => {
        if (!current) {
          visibleSinceRef.current = Date.now();
          setProgress(START_VALUE);
        }
        return true;
      });

      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          setProgress((value) => {
            if (value >= MAX_AUTO_VALUE) return value;
            const remaining = MAX_AUTO_VALUE - value;
            const step = Math.max(1, remaining * 0.12);
            return Math.min(MAX_AUTO_VALUE, value + step);
          });
        }, 180);
      }

      return;
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!visible) return;

    setProgress(100);
    const elapsed = Date.now() - visibleSinceRef.current;
    const delay = Math.max(120, MIN_VISIBLE_MS - elapsed);

    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
      hideTimeoutRef.current = null;
    }, delay);
  }, [activeCount, visible]);

  const value = useMemo(() => ({
    start() {
      setActiveCount((count) => count + 1);
    },
    done() {
      setActiveCount((count) => Math.max(0, count - 1));
    },
    visible,
    progress,
  }), [progress, visible]);

  return <PageProgressContext.Provider value={value}>{children}</PageProgressContext.Provider>;
}

export function usePageProgress() {
  const context = useContext(PageProgressContext);

  if (!context) {
    throw new Error("usePageProgress must be used within a PageProgressProvider");
  }

  return context;
}
