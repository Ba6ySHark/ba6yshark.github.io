// Highlight the current section in the navigation bar.
//
// Fix for Issue #22: section highlighting could drift / desync when sections
// have different heights or when scrolling quickly. We now use IntersectionObserver
// for robust, viewport-based section detection.

const sections = Array.from(document.querySelectorAll("section[id]"));
const links = Array.from(document.querySelectorAll("nav li a[href^='#']"));

const linkBySectionId = new Map();
for (const a of links) {
  const id = (a.getAttribute("href") || "").replace("#", "").trim();
  if (id) linkBySectionId.set(id, a);
}

function setActiveSection(sectionId) {
  for (const a of links) {
    a.parentElement?.classList.remove("current-page");
  }
  const activeLink = linkBySectionId.get(sectionId);
  if (activeLink) {
    activeLink.parentElement?.classList.add("current-page");
  }
}

function pickInitialSection() {
  // Prefer current hash if present.
  const hashId = (window.location.hash || "").replace("#", "").trim();
  if (hashId && linkBySectionId.has(hashId)) {
    setActiveSection(hashId);
    return;
  }

  // Otherwise choose the section whose top is closest to the top of the viewport.
  let bestId = sections[0]?.id;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const s of sections) {
    const dist = Math.abs(s.getBoundingClientRect().top);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = s.id;
    }
  }
  if (bestId) setActiveSection(bestId);
}

window.addEventListener("load", pickInitialSection);

// Observe sections and activate the one that occupies the "middle band" of the viewport.
// Using rootMargin creates a band roughly around the middle to avoid jitter.
const observer = new IntersectionObserver(
  (entries) => {
    // Among intersecting entries, choose the one with the highest intersection ratio.
    const visible = entries.filter((e) => e.isIntersecting);
    if (!visible.length) return;

    visible.sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
    const top = visible[0];
    const id = top.target?.id;
    if (id) setActiveSection(id);
  },
  {
    root: null,
    // Activate when the section is within the center-ish region of the viewport.
    // (Top 35% to bottom 55% roughly)
    rootMargin: "-35% 0px -55% 0px",
    threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75],
  }
);

for (const s of sections) observer.observe(s);

// If the user clicks a nav link, update immediately (scroll will confirm after).
for (const a of links) {
  a.addEventListener("click", () => {
    const id = (a.getAttribute("href") || "").replace("#", "").trim();
    if (id) setActiveSection(id);
  });
}
