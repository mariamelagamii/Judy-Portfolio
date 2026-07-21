let projects = [];
let activeCategory = "الكل";

const projectsContainer = document.getElementById("projectsContainer");
const categoriesContainer = document.getElementById("categories");
const emptyState = document.getElementById("emptyState");
const navbar = document.getElementById("navbar");

async function loadProjects() {
  try {
    const response = await fetch("assets/data/projects.json");

    if (!response.ok) {
      throw new Error(`تعذر تحميل البيانات: ${response.status}`);
    }

    projects = await response.json();
    renderCategories();
    renderProjects(projects);
  } catch (error) {
    console.error(error);
  }
}

function getCategories() {
  return ["الكل", ...new Set(projects.map((project) => project.category))];
}

function renderCategories() {
  categoriesContainer.innerHTML = getCategories()
    .map(
      (category) => `
      <button
        type="button"
        class="category-btn ${category === activeCategory ? "active" : ""}"
        data-category="${escapeHtml(category)}"
      >
        ${escapeHtml(category)}
      </button>
    `,
    )
    .join("");

  categoriesContainer.querySelectorAll(".category-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;

      categoriesContainer
        .querySelectorAll(".category-btn")
        .forEach((btn) => btn.classList.toggle("active", btn === button));

      const filtered =
        activeCategory === "الكل"
          ? projects
          : projects.filter((project) => project.category === activeCategory);

      renderProjects(filtered);
    });
  });
}

function renderProjects(data) {
  emptyState.hidden = data.length !== 0;

  projectsContainer.innerHTML = data
    .map(
      (project) => `
      <article class="project-card">
        <a class="project-preview" href="${escapeAttribute(project.website)}" target="_blank" rel="noopener">
          <img src="${escapeAttribute(project.image)}" alt="${escapeAttribute(project.name)}" loading="lazy">
        </a>

        <div class="project-category-icon">
          <i class="${escapeAttribute(project.icon || "fa-solid fa-store")}"></i>
        </div>

        <div class="project-content">
          <h2 class="project-title">${escapeHtml(project.name)}</h2>
          <span class="project-tag">${escapeHtml(project.category)}</span>
          <p class="project-description">${escapeHtml(project.description)}</p>

          <div class="project-actions">
            <a class="project-link" href="${escapeAttribute(project.website)}" target="_blank" rel="noopener">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              عرض الموقع
            </a>
          </div>
        </div>
      </article>
    `,
    )
    .join("");
}

function openProjectModal(project) {
  const modal = document.createElement("div");
  modal.className = "project-modal";
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="تفاصيل ${escapeAttribute(project.name)}">
      <button class="modal-close" type="button" aria-label="إغلاق">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <img class="modal-image" src="${escapeAttribute(project.image)}" alt="${escapeAttribute(project.name)}">

      <div class="modal-body">
        <span class="project-tag">${escapeHtml(project.category)}</span>
        <h3>${escapeHtml(project.name)}</h3>
        <p>${escapeHtml(project.longDescription || project.description)}</p>

        <a class="project-link" href="${escapeAttribute(project.website)}" target="_blank" rel="noopener">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          زيارة المتجر
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("open"));

  const closeModal = () => {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 200);
  };

  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function escapeHandler(event) {
    if (event.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escapeHandler);
    }
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

/* Category horizontal scroll */
document.getElementById("scrollLeft").addEventListener("click", () => {
  categoriesContainer.scrollBy({ left: -260, behavior: "smooth" });
});

document.getElementById("scrollRight").addEventListener("click", () => {
  categoriesContainer.scrollBy({ left: 260, behavior: "smooth" });
});
const testimonialsTrack = document.getElementById("testimonialsTrack");
const testimonialNext = document.getElementById("testimonialNext");
const testimonialPrev = document.getElementById("testimonialPrev");
const testimonialsDots = document.getElementById("testimonialsDots");

let testimonials = [];

async function loadTestimonials() {
  try {
    const response = await fetch("assets/data/testimonials.json");

    if (!response.ok) {
      throw new Error(`تعذر تحميل آراء العملاء: ${response.status}`);
    }

    testimonials = await response.json();

    renderTestimonials();
    createTestimonialsDots();
    updateActiveTestimonialDot();
  } catch (error) {
    console.error(error);

    testimonialsTrack.innerHTML = `
      <div class="testimonials-error">
        تعذر تحميل آراء العملاء حاليًا.
      </div>
    `;
  }
}

function renderTestimonials() {
  testimonialsTrack.innerHTML = testimonials
    .map((testimonial) => {
      const rate = Math.min(5, Math.max(0, Number(testimonial.rate) || 0));

      const stars = Array.from(
        { length: 5 },
        (_, index) => `
          <i class="${
            index < rate ? "fa-solid fa-star" : "fa-regular fa-star"
          }"></i>
        `,
      ).join("");

      return `
        <article class="testimonial-card">
          <div class="testimonial-card-top">
            <div class="client-info">
              <div class="client-logo">
                <i class="${escapeAttribute(
                  testimonial.icon || "fa-solid fa-store",
                )}"></i>
              </div>

              <div>
                <h3>${escapeHtml(testimonial.name)}</h3>
                <span>${escapeHtml(testimonial.category)}</span>
              </div>
            </div>

            <span class="quote-icon">
              <i class="fa-solid fa-quote-right"></i>
            </span>
          </div>

          <div
            class="testimonial-stars"
            aria-label="تقييم ${rate} من 5"
          >
            ${stars}
          </div>

          <p class="testimonial-text">
            ${escapeHtml(testimonial.review)}
          </p>

          <div class="testimonial-footer">
            ${
              testimonial.verified
                ? `
                  <span>
                    <i class="fa-solid fa-circle-check"></i>
                    عميل موثّق
                  </span>
                `
                : "<span></span>"
            }

            <small>${escapeHtml(testimonial.service)}</small>
          </div>
        </article>
      `;
    })
    .join("");
}

function getTestimonialCards() {
  return [...testimonialsTrack.querySelectorAll(".testimonial-card")];
}

function getTestimonialScrollAmount() {
  const firstCard = getTestimonialCards()[0];

  if (!firstCard) return 0;

  const trackStyles = window.getComputedStyle(testimonialsTrack);
  const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;

  return firstCard.offsetWidth + gap;
}

function createTestimonialsDots() {
  testimonialsDots.innerHTML = "";

  getTestimonialCards().forEach((_, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "testimonial-dot";
    dot.setAttribute("aria-label", `الانتقال إلى رأي العميل ${index + 1}`);

    dot.addEventListener("click", () => {
      testimonialsTrack.scrollTo({
        left: index * getTestimonialScrollAmount(),
        behavior: "smooth",
      });
    });

    testimonialsDots.appendChild(dot);
  });
}

function updateActiveTestimonialDot() {
  const scrollAmount = getTestimonialScrollAmount();

  if (!scrollAmount) return;

  const activeIndex = Math.round(
    Math.abs(testimonialsTrack.scrollLeft) / scrollAmount,
  );

  testimonialsDots
    .querySelectorAll(".testimonial-dot")
    .forEach((dot, index) => {
      dot.classList.toggle("active", index === activeIndex);
    });
}

testimonialNext?.addEventListener("click", () => {
  testimonialsTrack.scrollBy({
    left: getTestimonialScrollAmount(),
    behavior: "smooth",
  });
});

testimonialPrev?.addEventListener("click", () => {
  testimonialsTrack.scrollBy({
    left: -getTestimonialScrollAmount(),
    behavior: "smooth",
  });
});

testimonialsTrack?.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateActiveTestimonialDot);
});

window.addEventListener("resize", updateActiveTestimonialDot);

loadTestimonials();
// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();
// scroll to top button
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});
scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
// Load projects on page load
loadProjects();
