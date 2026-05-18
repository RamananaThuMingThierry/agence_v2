import React, { useEffect, useState } from "react";

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" />
    </svg>
  );
}

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 240);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: scale(1); box-shadow: 0 18px 40px rgba(163, 4, 4, 0.22); }
            50% { transform: scale(1.08); box-shadow: 0 24px 52px rgba(255, 0, 0, 0.34); }
          }
        `}
      </style>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Retour en haut"
        className={`fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-700 text-white transition duration-300 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ animation: visible ? "breathe 2.8s ease-in-out infinite" : "none" }}
      >
        <ArrowUpIcon />
      </button>
    </>
  );
}
