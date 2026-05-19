export function normalizeSectionTarget(href = "") {
  if (!href || typeof href !== "string") return null;

  if (href.startsWith("/#")) {
    return { path: "/", id: href.slice(2) };
  }

  if (href.startsWith("#")) {
    return { path: "/", id: href.slice(1) };
  }

  return null;
}

export function scrollToPublicSection(id) {
  if (!id || typeof document === "undefined") return false;

  const element = document.getElementById(id);
  if (!element) return false;

  element.scrollIntoView({ behavior: "smooth", block: "start" });

  if (typeof window !== "undefined") {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }

  return true;
}

export function queuePublicSectionScroll(id) {
  if (!id || typeof window === "undefined") return;
  window.sessionStorage.setItem("public-scroll-target", id);
}

export function consumePublicSectionScroll() {
  if (typeof window === "undefined") return null;

  const id = window.sessionStorage.getItem("public-scroll-target");
  if (!id) return null;

  window.sessionStorage.removeItem("public-scroll-target");
  return id;
}
