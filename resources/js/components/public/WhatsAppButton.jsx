import React from "react";

export default function WhatsAppButton({ href = "#contact" }) {
  return (
    <a href={href} className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-5 py-4 font-bold text-white shadow-2xl transition hover:bg-green-600">
      WhatsApp
    </a>
  );
}
