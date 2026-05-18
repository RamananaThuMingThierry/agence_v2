import React from "react";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.7V11H8v3h2.3v7h3.2Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M21.8 8.2a2.9 2.9 0 0 0-2-2C18 5.7 12 5.7 12 5.7s-6 0-7.8.5a2.9 2.9 0 0 0-2 2A30.4 30.4 0 0 0 1.7 12a30.4 30.4 0 0 0 .5 3.8 2.9 2.9 0 0 0 2 2c1.8.5 7.8.5 7.8.5s6 0 7.8-.5a2.9 2.9 0 0 0 2-2 30.4 30.4 0 0 0 .5-3.8 30.4 30.4 0 0 0-.5-3.8ZM10 15.2V8.8l5.5 3.2Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.3 4.8 4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm5.7 13.8c-.2.6-1.3 1.1-1.9 1.2-.5.1-1.1.2-3.6-.8-3.2-1.4-5.3-4.8-5.5-5.1-.2-.3-1.3-1.7-1.3-3.2 0-1.6.8-2.4 1.1-2.8.3-.3.7-.4.9-.4h.7c.2 0 .5 0 .7.6.2.5.8 1.9.9 2 .1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 2 2.2 1.3 1.1 2.4 1.5 2.8 1.7.3.1.5.1.7-.1l.8-1c.2-.3.5-.3.8-.2.3.1 1.8.9 2.1 1 .3.2.5.2.6.4.1.1.1.8-.1 1.4Z" />
    </svg>
  );
}

export default function PublicFooter({ footerLinks, logo = "/images/logo.png", brand = "Monde de Madagascar" }) {
  const socialLinks = [
    { label: "Facebook", href: "#", icon: <FacebookIcon />, tone: "bg-[#1877F2] text-white hover:bg-[#1669d8]" },
    { label: "Instagram", href: "#", icon: <InstagramIcon />, tone: "bg-[#E4405F] text-white hover:bg-[#cc3754]" },
    { label: "YouTube", href: "#", icon: <YouTubeIcon />, tone: "bg-[#FF0000] text-white hover:bg-[#e00000]" },
    { label: "WhatsApp", href: "https://wa.me/261380913703", icon: <WhatsAppIcon />, tone: "bg-[#25D366] text-white hover:bg-[#20ba59]" },
  ];

  const payments = ["Visa", "Mastercard", "American Express", "PayPal", "Virement bancaire", "Mobile Money"];

  return (
    <footer className="bg-slate-950 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_1fr]">
        <div>
          <a href="/#home" className="mb-3 inline-flex items-center gap-3">
            <img src={logo} alt={`${brand} logo`} className="h-14 w-14 rounded bg-white p-1 object-contain" />
            <h3 className="text-xl font-extrabold text-red-500">{brand}</h3>
          </a>
          <p className="max-w-md text-white/60">Agence locale specialisee dans les circuits prives et personnalises a Madagascar.</p>
          <a href="/login" className="mt-5 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
            Se connecter
          </a>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white">Navigation</h4>
          <div className="space-y-2 text-sm text-white/60">
            {footerLinks.map((item) => (
              <a
                key={item.href || item.label || item}
                href={item.href || "#"}
                className="block transition hover:text-white"
              >
                {item.label || item}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white">Paiements</h4>
          <div className="space-y-2 text-sm text-white/60">
            {payments.map((payment) => (
              <p key={payment}>{payment}</p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white">Localisation</h4>
          <div className="space-y-2 text-sm text-white/60">
            <p>Antananarivo, Madagascar</p>
            <p>Ambavahaditokona, Antananarivo</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white">Reseaux sociaux</h4>
            <div className="flex flex-wrap gap-3 text-sm text-white/60">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${item.tone}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-4 pt-6 text-sm text-center text-white/50">&copy; 2026 Monde de Madagascar.</div>
    </footer>
  );
}

