document.querySelectorAll("[data-switch-url]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-switch-url");
    if (target) {
      window.location.href = target;
    }
  });
});

const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const page = document.body?.dataset?.page;
const contactForm = document.querySelector(".contact-form");

if (toggle && header) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  if (link.dataset.nav === page) {
    link.classList.add("is-active");
  }

  link.addEventListener("click", () => {
    header?.classList.remove("nav-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert(
      contactForm.dataset.alertMessage ||
        "這是展示版表單。提供正式信箱或 API 後，我可以幫你接上真正的詢價流程。"
    );
  });
}

const swapSvgPlaceholdersToJpg = async () => {
  const images = [...document.querySelectorAll('img.media-image[src$=".svg"]')];

  await Promise.all(
    images.map(async (img) => {
      const currentSrc = img.getAttribute("src") || "";
      const jpgSrc = currentSrc.replace(/\.svg$/i, ".jpg");

      try {
        const response = await fetch(jpgSrc, { method: "HEAD", cache: "no-store" });
        if (response.ok) {
          img.src = jpgSrc;
        }
      } catch {
        // Keep the SVG placeholder when JPG is unavailable.
      }
    })
  );
};

const previewMode = new URLSearchParams(window.location.search).get("cmsPreview") === "1";

if (previewMode) {
  window.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const element = target.closest("[data-cms-field]");
    if (!element || window.parent === window) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    window.parent.postMessage(
      {
        type: "cms-focus-field",
        field: element.getAttribute("data-cms-field")
      },
      "*"
    );
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type !== "cms-preview-patch") {
      return;
    }

    const { field, value } = event.data;
    if (!field) {
      return;
    }

    const escapedField = CSS.escape(field);
    const nodes = document.querySelectorAll(`[data-cms-field="${escapedField}"]`);
    nodes.forEach((node) => {
      if (node.tagName === "IMG") {
        node.setAttribute("src", value);
      } else {
        node.textContent = value;
      }
    });
  });
}

swapSvgPlaceholdersToJpg();
