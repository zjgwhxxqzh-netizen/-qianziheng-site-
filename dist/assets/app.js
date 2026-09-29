document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#main-nav");

const updateHeader = () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });

  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && document.body.classList.contains("motion-on")) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const sectionLinks = [...document.querySelectorAll("#main-nav a[href^='#']")];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-25% 0px -65%", threshold: 0 });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll(".photo-toolbar").forEach((toolbar) => {
  const section = toolbar.closest("section");
  const cards = section ? [...section.querySelectorAll(".shot")] : [];
  toolbar.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      toolbar.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
      cards.forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter));
    });
  });
});

document.querySelectorAll('[data-app="ipo-calculator"]').forEach((app) => {
  const form = app.querySelector("form");
  const output = app.querySelector("output");
  if (!form || !output) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const issue = Number(new FormData(form).get("issue"));
    const close = Number(new FormData(form).get("close"));
    if (!Number.isFinite(issue) || !Number.isFinite(close) || issue <= 0 || close < 0) {
      output.textContent = "请输入有效且不小于 0 的价格";
      return;
    }
    const result = ((close - issue) / issue) * 100;
    const label = output.dataset.label || "计算结果";
    output.textContent = `${label}：${result.toFixed(2)}%`;
  });
});

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
