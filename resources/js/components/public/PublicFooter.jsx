import React from "react";

export default function PublicFooter({ footerLinks, contactLinks }) {
  return (
    <footer className="bg-slate-950 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 md:flex-row">
        <div><h3 className="mb-3 text-xl font-extrabold">World of Madagascar Tour</h3><p className="max-w-md text-white/60">Agence locale specialisee dans les circuits prives et personnalises a Madagascar.</p></div>
        <div className="grid grid-cols-2 gap-10 text-sm"><div><h4 className="mb-3 font-bold">Navigation</h4><div className="space-y-2 text-white/60">{footerLinks.map((item) => <p key={item}>{item}</p>)}</div></div><div><h4 className="mb-3 font-bold">Contact</h4><div className="space-y-2 text-white/60">{contactLinks.map((item) => <p key={item}>{item}</p>)}</div></div></div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-4 pt-6 text-sm text-white/50">© 2026 World of Madagascar Tour. Tous droits reserves.</div>
    </footer>
  );
}
