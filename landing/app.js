document.documentElement.classList.add("js");

const dialog = document.querySelector(".founder-dialog");
const openFounder = document.querySelectorAll("[data-open-founder]");
const closeFounder = document.querySelector("[data-close-founder]");
const founderForm = document.querySelector("#founder-form");
const localPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const founderApi = localPreview
  ? "http://127.0.0.1:8787/v1/founders"
  : document.querySelector('meta[name="campus-founder-api"]')?.content || `${window.location.origin}/v1/founders`;
const turnstileSiteKey = document.querySelector('meta[name="campus-turnstile-site-key"]')?.content;
const turnstileSlot = document.querySelector(".turnstile-slot");
const formStatus = document.querySelector("#form-status");
const founderToast = document.querySelector("#founder-toast");
const submitButton = founderForm.querySelector('button[type="submit"]');
let turnstileToken = "";
let toastTimeout;
let turnstileLoading = false;
let turnstileWidgetId;

const siteHeader = document.querySelector(".site-header");

let headerFrame;
let headerCompact = false;
/* The pill is 24px shorter than the full header, so collapsing it shifts the
   page up. With a single threshold that shift can push the scroll back below
   the trigger and the header oscillates, so grow and shrink use separate
   marks and the gap between them is wider than the height it reclaims. */
const syncHeader = () => {
  const y = window.scrollY;
  if (!headerCompact && y > 96) headerCompact = true;
  else if (headerCompact && y < 40) headerCompact = false;
  siteHeader?.classList.toggle("is-scrolled", headerCompact);
  headerFrame = undefined;
};

window.addEventListener("scroll", () => {
  if (headerFrame) return;
  headerFrame = window.requestAnimationFrame(syncHeader);
}, { passive: true });
syncHeader();

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const renderTurnstile = () => {
  if (!window.turnstile || turnstileWidgetId !== undefined) return;
  turnstileSlot.dataset.state = "";
  turnstileWidgetId = window.turnstile.render(turnstileSlot, {
    sitekey: turnstileSiteKey,
    callback: (token) => { turnstileToken = token; },
    "expired-callback": () => { turnstileToken = ""; },
    "error-callback": () => { turnstileToken = ""; },
  });
};

const loadTurnstile = () => {
  if (!turnstileSiteKey || !turnstileSlot || turnstileWidgetId !== undefined) return;
  if (window.turnstile) {
    renderTurnstile();
    return;
  }
  if (turnstileLoading) return;

  turnstileLoading = true;
  turnstileSlot.dataset.state = "loading";
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.onload = renderTurnstile;
  script.onerror = () => {
    turnstileSlot.dataset.state = "";
    formStatus.dataset.state = "error";
    formStatus.textContent = "No pudimos cargar la verificaci\u00f3n. Intenta de nuevo.";
  };
  document.head.append(script);
};

openFounder.forEach((button) => button.addEventListener("click", () => {
  dialog.showModal();
  loadTurnstile();
}));
closeFounder.addEventListener("click", () => dialog.close());

const showFounderToast = () => {
  window.clearTimeout(toastTimeout);
  founderToast.hidden = false;
  toastTimeout = window.setTimeout(() => { founderToast.hidden = true; }, 6000);
};

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

founderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(founderForm);
  formStatus.textContent = "";
  formStatus.dataset.state = "";
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  try {
    const response = await fetch(founderApi, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        whatsapp: data.get("whatsapp"),
        career: data.get("career"),
        cycle: data.get("cycle"),
        intent: data.get("intent"),
        website: data.get("website"),
        turnstileToken,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "No pudimos enviar tu solicitud.");
    founderForm.reset();
    turnstileToken = "";
    dialog.close();
    showFounderToast();
  } catch (error) {
    formStatus.dataset.state = "error";
    formStatus.textContent = error instanceof Error ? error.message : "No pudimos enviar tu solicitud.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar mi solicitud <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><use href="assets/lucide.svg#arrow-right"></use></svg>';
  }
});
