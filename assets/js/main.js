let projects = [];
let activeCategory = "الكل";

const projectsContainer = document.getElementById("projectsContainer");
const categoryShowcase = document.getElementById("categoryShowcase");
const categoryNext = document.getElementById("categoryNext");
const categoryPrev = document.getElementById("categoryPrev");
const projectsTitle = document.getElementById("projectsTitle");
const projectsSubtitle = document.getElementById("projectsSubtitle");
function getCategoryScrollAmount() {
  const firstCard = categoryShowcase?.querySelector(".category-showcase-card");

  if (!firstCard || !categoryShowcase) return 0;

  const styles = window.getComputedStyle(categoryShowcase);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;

  return firstCard.offsetWidth + gap;
}
function updateProjectsHeading(category) {
  if (!projectsTitle || !projectsSubtitle) return;

  if (category === "الكل") {
    projectsTitle.textContent = "جميع المشاريع";
    projectsSubtitle.textContent =
      "استعرض جميع الأعمال والخدمات التي قمنا بتنفيذها.";
    return;
  }

  projectsTitle.textContent = category;

  projectsSubtitle.textContent = `عرض جميع المشاريع الخاصة بتصنيف ${category}.`;
}
categoryNext?.addEventListener("click", () => {
  categoryShowcase.scrollBy({
    left: getCategoryScrollAmount(),
    behavior: "smooth",
  });
});

categoryPrev?.addEventListener("click", () => {
  categoryShowcase.scrollBy({
    left: -getCategoryScrollAmount(),
    behavior: "smooth",
  });
});

/* Drag بالماوس */

let isCategoryDragging = false;
let categoryDragStartX = 0;
let categoryInitialScrollLeft = 0;
let categoryHasMoved = false;

categoryShowcase?.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;

  isCategoryDragging = true;
  categoryHasMoved = false;
  categoryDragStartX = event.clientX;
  categoryInitialScrollLeft = categoryShowcase.scrollLeft;

  categoryShowcase.classList.add("dragging");
});

window.addEventListener("mousemove", (event) => {
  if (!isCategoryDragging || !categoryShowcase) return;

  const distance = event.clientX - categoryDragStartX;

  if (Math.abs(distance) > 5) {
    categoryHasMoved = true;
  }

  categoryShowcase.scrollLeft = categoryInitialScrollLeft - distance;
});

function stopCategoryDragging() {
  if (!isCategoryDragging || !categoryShowcase) return;

  isCategoryDragging = false;
  categoryShowcase.classList.remove("dragging");

  snapToNearestCategory();
  updateCategoryArrows();
}

window.addEventListener("mouseup", stopCategoryDragging);
window.addEventListener("blur", stopCategoryDragging);

/* منع تشغيل الفلتر عند السحب بدل الضغط */

categoryShowcase?.addEventListener(
  "click",
  (event) => {
    if (!categoryHasMoved) return;

    event.preventDefault();
    event.stopPropagation();
    categoryHasMoved = false;
  },
  true,
);

/* تعطيل السهم عند بداية ونهاية الـ Slider */

function updateCategoryArrows() {
  if (!categoryShowcase) return;

  const maxScroll = categoryShowcase.scrollWidth - categoryShowcase.clientWidth;

  const currentScroll = Math.abs(categoryShowcase.scrollLeft);

  if (categoryNext) {
    categoryNext.disabled = currentScroll <= 2;
  }

  if (categoryPrev) {
    categoryPrev.disabled = currentScroll >= maxScroll - 2;
  }
}

window.addEventListener("resize", () => {
  updateCategoryArrows();
  snapToNearestCategory();
});
const emptyState = document.getElementById("emptyState");

/* =========================
   حماية النصوص
========================= */

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

/* =========================
   Projects
========================= */

async function loadProjects() {
  try {
    const response = await fetch("assets/data/projects.json");

    if (!response.ok) {
      throw new Error(`تعذر تحميل البيانات: ${response.status}`);
    }

    projects = await response.json();

    renderCategoryShowcase();
    renderProjects(projects);
    updateProjectsHeading(activeCategory);
  } catch (error) {
    console.error(error);

    if (projectsContainer) {
      projectsContainer.innerHTML = `
        <div class="projects-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>تعذر تحميل المشاريع</h3>
          <p>تأكدي من مسار ملف projects.json.</p>
        </div>
      `;
    }
  }
}

function getCategories() {
  return [
    "الكل",
    ...new Set(projects.map((project) => project.category).filter(Boolean)),
  ];
}
function getCategoryInfo(category) {
  const info = {
    الكل: {
      title: "جميع أعمالنا",
      description: "استعرض جميع المشاريع والخدمات التي قمنا بتنفيذها",
      icon: "fa-solid fa-layer-group",
    },

    "تصميم المتاجر": {
      title: "تصميم المتاجر",
      description: "تصميم وتطوير متاجر إلكترونية احترافية ومتجاوبة",
      icon: "fa-solid fa-cart-shopping",
    },

    "تصميم صور": {
      title: "تصميم الصور",
      description: "تصاميم إبداعية للمنتجات والإعلانات والمحتوى",
      icon: "fa-regular fa-image",
    },

    SEO: {
      title: "تحسين محركات البحث",
      description: "تحسين ظهور المواقع والمتاجر وزيادة الزيارات",
      icon: "fa-solid fa-magnifying-glass-chart",
    },

    التسويق: {
      title: "التسويق الرقمي",
      description: "حملات تسويقية تساعد العلامات التجارية على النمو",
      icon: "fa-solid fa-bullhorn",
    },

    "الهوية البصرية": {
      title: "الهوية البصرية",
      description: "تصميم هوية متكاملة تعكس شخصية العلامة التجارية",
      icon: "fa-solid fa-palette",
    },
  };

  return (
    info[category] || {
      title: category,
      description: `استعرض مشاريعنا في قسم ${category}`,
      icon: "fa-solid fa-folder-open",
    }
  );
}

function renderCategoryShowcase() {
  if (!categoryShowcase) return;

  const categories = getCategories();

  categoryShowcase.innerHTML = categories
    .map((category, index) => {
      const info = getCategoryInfo(category);

      return `
        <button
          type="button"
          class="category-showcase-card ${
            category === activeCategory ? "active" : ""
          }"
          data-category="${escapeAttribute(category)}"
          style="--category-index: ${index}"
        >
          <div class="category-showcase-top">
            <span>${escapeHtml(info.title)}</span>

            <i class="${escapeAttribute(info.icon)}"></i>
          </div>

          <h3>${escapeHtml(info.title)}</h3>

          <p>${escapeHtml(info.description)}</p>

          <span class="category-showcase-count">
            ${getCategoryCount(category)} مشروع
          </span>
        </button>
      `;
    })
    .join("");

  categoryShowcase
    .querySelectorAll(".category-showcase-card")
    .forEach((card) => {
      card.addEventListener("click", () => {
        activeCategory = card.dataset.category;
        updateProjectsHeading(activeCategory);
        categoryShowcase
          .querySelectorAll(".category-showcase-card")
          .forEach((item) => {
            item.classList.toggle("active", item === card);
          });

        const filteredProjects =
          activeCategory === "الكل"
            ? projects
            : projects.filter((project) => project.category === activeCategory);

        renderProjects(filteredProjects);
      });
    });
}

function getCategoryCount(category) {
  if (category === "الكل") {
    return projects.length;
  }

  return projects.filter((project) => project.category === category).length;
}
function renderProjects(data) {
  if (!projectsContainer || !emptyState) return;

  emptyState.hidden = data.length !== 0;

  projectsContainer.innerHTML = data
    .map(
      (project) => `
        <article class="project-card">
          <a
            class="project-preview"
            href="${escapeAttribute(project.website || "#")}"
            target="_blank"
            rel="noopener"
            aria-label="عرض مشروع ${escapeAttribute(project.name)}"
          >
            <img
              src="${escapeAttribute(project.image)}"
              alt="${escapeAttribute(project.name)}"
              loading="lazy"
            >
          </a>

          <div class="project-category-icon">
            <i class="${escapeAttribute(
              project.icon || "fa-solid fa-store",
            )}"></i>
          </div>

          <div class="project-content">
            <h2 class="project-title">
              ${escapeHtml(project.name)}
            </h2>

            <span class="project-tag">
              ${escapeHtml(project.category)}
            </span>

            <p class="project-description">
              ${escapeHtml(project.description)}
            </p>

            <div class="project-actions">
              <a
                class="project-link"
                href="${escapeAttribute(project.website || "#")}"
                target="_blank"
                rel="noopener"
              >
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

/* =========================
   Testimonials
========================= */

const testimonialsTrack = document.getElementById("testimonialsTrack");

const testimonialNext = document.getElementById("testimonialNext");

const testimonialPrev = document.getElementById("testimonialPrev");

const testimonialsDots = document.getElementById("testimonialsDots");

let testimonials = [];
let activeTestimonialIndex = 0;
let testimonialsScrollTimer = null;

/* تحميل الآراء */

async function loadTestimonials() {
  try {
    const response = await fetch("assets/data/testimonials.json");

    if (!response.ok) {
      throw new Error(`تعذر تحميل آراء العملاء: ${response.status}`);
    }

    testimonials = await response.json();

    renderTestimonials();
    createTestimonialsDots();

    requestAnimationFrame(() => {
      goToTestimonial(0, "auto");
    });
  } catch (error) {
    console.error(error);

    if (testimonialsTrack) {
      testimonialsTrack.innerHTML = `
        <div class="testimonials-error">
          تعذر تحميل آراء العملاء حاليًا.
        </div>
      `;
    }
  }
}

/* إنشاء الكروت */

function renderTestimonials() {
  if (!testimonialsTrack) return;

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
                <h3>
                  ${escapeHtml(testimonial.name)}
                </h3>

                <span>
                  ${escapeHtml(testimonial.category)}
                </span>
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

            <small>
              ${escapeHtml(testimonial.service)}
            </small>
          </div>
        </article>
      `;
    })
    .join("");
}

/* الكروت */

function getTestimonialCards() {
  if (!testimonialsTrack) return [];

  return Array.from(testimonialsTrack.querySelectorAll(".testimonial-card"));
}

/* عدد الكروت الظاهرة */

function getVisibleTestimonialsCount() {
  const cards = getTestimonialCards();

  if (!testimonialsTrack || !cards.length) {
    return 1;
  }

  const cardWidth = cards[0].getBoundingClientRect().width;

  const styles = window.getComputedStyle(testimonialsTrack);

  const gap = parseFloat(styles.columnGap || styles.gap) || 0;

  return Math.max(
    1,
    Math.round(testimonialsTrack.clientWidth / (cardWidth + gap)),
  );
}

/* آخر موضع ممكن */

function getLastTestimonialIndex() {
  const cards = getTestimonialCards();

  return Math.max(0, cards.length - getVisibleTestimonialsCount());
}

/* الانتقال إلى رأي */

function goToTestimonial(index, behavior = "smooth") {
  if (!testimonialsTrack) return;

  const cards = getTestimonialCards();

  if (!cards.length) return;

  const lastIndex = getLastTestimonialIndex();

  activeTestimonialIndex = Math.max(0, Math.min(index, lastIndex));

  const targetCard = cards[activeTestimonialIndex];

  if (!targetCard) return;

  testimonialsTrack.scrollTo({
    left: targetCard.offsetLeft,
    behavior,
  });

  updateTestimonialsControls();
}

/* إنشاء النقاط */

function createTestimonialsDots() {
  if (!testimonialsDots) return;

  testimonialsDots.innerHTML = "";

  const totalDots = getLastTestimonialIndex() + 1;

  for (let index = 0; index < totalDots; index++) {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "testimonial-dot";

    dot.setAttribute("aria-label", `الانتقال إلى مجموعة الآراء ${index + 1}`);

    dot.addEventListener("click", () => {
      goToTestimonial(index);
    });

    testimonialsDots.appendChild(dot);
  }

  updateTestimonialsDots();
}

/* تحديث النقاط */

function updateTestimonialsDots() {
  if (!testimonialsDots) return;

  testimonialsDots
    .querySelectorAll(".testimonial-dot")
    .forEach((dot, index) => {
      dot.classList.toggle("active", index === activeTestimonialIndex);
    });
}

/* تحديث الأسهم */

function updateTestimonialsArrows() {
  const lastIndex = getLastTestimonialIndex();

  if (testimonialPrev) {
    testimonialPrev.disabled = activeTestimonialIndex <= 0;
  }

  if (testimonialNext) {
    testimonialNext.disabled = activeTestimonialIndex >= lastIndex;
  }
}

function updateTestimonialsControls() {
  updateTestimonialsDots();
  updateTestimonialsArrows();
}

/* الأسهم */

testimonialNext?.addEventListener("click", () => {
  goToTestimonial(activeTestimonialIndex + 1);
});

testimonialPrev?.addEventListener("click", () => {
  goToTestimonial(activeTestimonialIndex - 1);
});

/* تحديث النقطة أثناء السكرول اليدوي */

testimonialsTrack?.addEventListener(
  "scroll",
  () => {
    clearTimeout(testimonialsScrollTimer);

    testimonialsScrollTimer = setTimeout(() => {
      const cards = getTestimonialCards();

      if (!cards.length) return;

      let nearestIndex = 0;
      let nearestDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs(
          testimonialsTrack.scrollLeft - card.offsetLeft,
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;

          nearestIndex = index;
        }
      });

      activeTestimonialIndex = Math.min(
        nearestIndex,
        getLastTestimonialIndex(),
      );

      updateTestimonialsControls();
    }, 100);
  },
  { passive: true },
);

/* تحديث عند تغيير المقاس */

window.addEventListener("resize", () => {
  clearTimeout(testimonialsScrollTimer);

  testimonialsScrollTimer = setTimeout(() => {
    createTestimonialsDots();

    goToTestimonial(
      Math.min(activeTestimonialIndex, getLastTestimonialIndex()),
      "auto",
    );
  }, 120);
});
/* =========================
   Footer year
========================= */

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================
   Scroll to top
========================= */

const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (!scrollBtn) return;

  scrollBtn.classList.toggle("show", window.scrollY > 400);
});

scrollBtn?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

/* =========================
   Initial loading
========================= */

loadProjects();
loadTestimonials();
