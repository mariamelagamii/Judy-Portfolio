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

/* بعد السحب: يثبت على أقرب بطاقة (القيمة سالبة في الصفحات العربية) */

function snapToNearestCategory() {
  if (!categoryShowcase) return;

  const step = getCategoryScrollAmount();

  if (!step) return;

  categoryShowcase.scrollTo({
    left: Math.round(categoryShowcase.scrollLeft / step) * step,
    behavior: "smooth",
  });
}

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

    projects = (await response.json())
      .filter((project) => !project.hidden)
      .map((project) => ({ ...project, category: String(project.category || "").trim() }));

    activeCategory = getCategoryFromUrl();
    renderCategoryShowcase();
    selectCategory(activeCategory, { updateUrl: false });
  } catch (error) {
    console.error(error);

    if (projectsContainer) {
      projectsContainer.innerHTML = `
        <div class="projects-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>تعذر تحميل المشاريع</h3>
        </div>
      `;
    }
  }
}

const CATEGORY_ORDER = [
  "الكل",
  "تصميم المتاجر",
  "السيو والظهور في جوجل",
  "التسويق والسوشيال",
  "الجرافيك والموشن",
];

/* روابط مباشرة لكل قسم: ?section=seo */
const CATEGORY_SLUGS = {
  "تصميم المتاجر": "stores",
  "السيو والظهور في جوجل": "seo",
  "التسويق والسوشيال": "marketing",
  "الجرافيك والموشن": "design",
};

function getCategories() {
  const present = new Set(projects.map((project) => project.category).filter(Boolean));
  const ordered = CATEGORY_ORDER.filter((c) => c === "الكل" || present.has(c));
  const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c));
  return [...ordered, ...extra];
}
function getCategoryInfo(category) {
  const info = {
    الكل: {
      title: "جميع أعمالنا",
      description: "كل المشاريع والخدمات اللي نفذناها",
      icon: "fa-solid fa-layer-group",
    },

    "تصميم المتاجر": {
      title: "تصميم المتاجر",
      description: "متاجر سلة صممناها وطورناها من الصفر",
      icon: "fa-solid fa-cart-shopping",
    },

    "السيو والظهور في جوجل": {
      title: "السيو والظهور في جوجل",
      description: "شغلنا عشان المتاجر تظهر في نتائج البحث",
      icon: "fa-solid fa-magnifying-glass-chart",
    },

    "التسويق والسوشيال": {
      title: "التسويق والسوشيال",
      description: "إدارة حملات وحسابات سوشيال للمتاجر",
      icon: "fa-solid fa-bullhorn",
    },

    "الجرافيك والموشن": {
      title: "الجرافيك والموشن",
      description: "بانرات وصور منتجات وفيديوهات موشن",
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

function selectCategory(category, { updateUrl = true } = {}) {
  activeCategory = getCategories().includes(category) ? category : "الكل";
  updateProjectsHeading(activeCategory);

  categoryShowcase
    ?.querySelectorAll(".category-showcase-card")
    .forEach((item) => {
      item.classList.toggle("active", item.dataset.category === activeCategory);
    });

  /* لما القسم يتفتح من رابط مباشر: نخلي بطاقته ظاهرة في الشريط */
  const activeCard = categoryShowcase?.querySelector(".category-showcase-card.active");
  if (activeCard && !updateUrl) {
    const box = categoryShowcase.getBoundingClientRect();
    const card = activeCard.getBoundingClientRect();
    categoryShowcase.scrollLeft += card.left - box.left - (box.width - card.width) / 2;
  }

  renderProjects(
    activeCategory === "الكل"
      ? projects
      : projects.filter((project) => project.category === activeCategory),
  );

  if (updateUrl) {
    const url = new URL(window.location.href);
    const slug = CATEGORY_SLUGS[activeCategory];
    if (slug) url.searchParams.set("section", slug);
    else url.searchParams.delete("section");
    history.replaceState(null, "", url);
  }
}

function getCategoryFromUrl() {
  const slug = new URLSearchParams(window.location.search).get("section");
  return Object.keys(CATEGORY_SLUGS).find((c) => CATEGORY_SLUGS[c] === slug) || "الكل";
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
          data-key="${CATEGORY_SLUGS[category] || "all"}"
          style="--category-index: ${index}"
        >
          <div class="category-showcase-top">

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
        selectCategory(card.dataset.category);
      });
    });
}

function getCategoryCount(category) {
  if (category === "الكل") {
    return projects.length;
  }

  return projects.filter((project) => project.category === category).length;
}
/* =========================
   زر الطلب على الواتساب
   ========================= */

const JUDY_WHATSAPP = "966552261549";

function getOrderCta(project) {
  const slug = CATEGORY_SLUGS[project.category] || "stores";
  if (project.type === "video") return { label: "أبي فيديو زي هذا", want: "أبي فيديو زيه لمتجري" };
  if (slug === "design") return { label: "أبي تصاميم زيها", want: "أبي تصاميم زيها لمتجري" };
  if (slug === "seo" || slug === "marketing") return { label: "أبي نتيجة زي هذي", want: "أبي نتيجة زيها لمتجري" };
  if (/^https?:/.test(project.id)) return { label: "اطلب خدمتك", want: "أبي أطلب خدمة لمتجري" };
  return { label: "أبي متجر زي هذا", want: "أبي متجر زيه" };
}

function getOrderLink(project) {
  const { want } = getOrderCta(project);
  const text = `السلام عليكم، شفت «${project.name.trim()}» في صفحة أعمالكم و${want}`;
  return `https://wa.me/${JUDY_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

/* =========================
   عرض الأعمال على دفعات (يظهر المزيد مع النزول)
   ========================= */

const PAGE_SIZE = 12;
let currentList = [];
let shownCount = 0;
let loadMoreObserver = null;

function renderProjects(data) {
  if (!projectsContainer || !emptyState) return;

  emptyState.hidden = data.length !== 0;
  currentList = data;
  shownCount = 0;
  projectsContainer.innerHTML = "";
  showMoreProjects();
}

function showMoreProjects() {
  const next = currentList.slice(shownCount, shownCount + PAGE_SIZE);
  projectsContainer.insertAdjacentHTML("beforeend", next.map(cardHtml).join(""));
  shownCount += next.length;
  updateLoadMore();
}

function updateLoadMore() {
  let wrap = document.getElementById("loadMoreWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "loadMoreWrap";
    wrap.className = "load-more";
    wrap.innerHTML = `<button type="button" class="load-more__btn"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>عرض المزيد من الأعمال</button>`;
    projectsContainer.after(wrap);
    wrap.querySelector("button").addEventListener("click", showMoreProjects);
    if ("IntersectionObserver" in window) {
      loadMoreObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && shownCount < currentList.length) showMoreProjects();
        },
        { rootMargin: "0px 0px 500px 0px" },
      );
      loadMoreObserver.observe(wrap);
    }
  }
  const left = currentList.length - shownCount;
  wrap.hidden = left <= 0;
  if (left > 0) {
    wrap.querySelector("button").lastChild.textContent = `عرض المزيد من الأعمال (${left})`;
  }
}

function cardHtml(project) {
        const isGallery = project.type === "gallery";
        const count = (project.images || []).length;
        const countLabel =
          count === 2 ? "صورتين" : count <= 10 ? `${count} صور` : `${count} صورة`;
        const isVideo = project.type === "video";
        const actionLabel = isGallery ? "شاهد الأعمال" : isVideo ? "شاهد الفيديو" : "عرض الموقع";
        const actionIcon = isGallery
          ? "fa-regular fa-images"
          : isVideo
            ? "fa-solid fa-play"
            : "fa-solid fa-arrow-up-right-from-square";
        return `
        <article class="project-card${isGallery ? " project-card--gallery" : ""}" data-key="${CATEGORY_SLUGS[project.category] || "stores"}">
          <a
            class="project-preview"
            href="${escapeAttribute(project.website || "#")}"
            data-project-preview
            data-project-id="${escapeAttribute(project.id)}"
            data-project-url="${escapeAttribute(project.website || "")}"
            data-project-name="${escapeAttribute(project.name)}"
            aria-label="عرض مشروع ${escapeAttribute(project.name)}"
          >
            ${isGallery && count > 1 ? `<span class="project-media-badge"><i class="fa-regular fa-images" aria-hidden="true"></i>${countLabel}</span>` : ""}
            ${isVideo ? `<span class="project-media-badge"><i class="fa-solid fa-play" aria-hidden="true"></i>فيديو</span>` : ""}
            <img
              src="${escapeAttribute(project.image)}"
              alt="${escapeAttribute(project.name)}"
              loading="lazy"
              decoding="async"
            >
          </a>

          <div class="project-category-icon">
            <img
              src="assets/media/brand/judy-mark.webp"
              alt=""
              aria-hidden="true"
            >
          </div>

          <div class="project-content">
            <h2 class="project-title">
              ${escapeHtml(project.name)}
            </h2>

            <span class="project-tag">
              ${escapeHtml(project.subCategory)}
            </span>

            <p class="project-description">
              ${escapeHtml(project.description)}
            </p>

            <div class="project-actions">
              <a
                class="project-link"
                href="${escapeAttribute(project.website || "#")}"
                data-project-preview
                data-project-id="${escapeAttribute(project.id)}"
                data-project-url="${escapeAttribute(project.website || "")}"
                data-project-name="${escapeAttribute(project.name)}"
              >
                <i class="${actionIcon}"></i>
                ${actionLabel}
              </a>
              <a
                class="project-order"
                href="${escapeAttribute(getOrderLink(project))}"
                target="_blank"
                rel="noopener"
              >
                <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                ${escapeHtml(getOrderCta(project).label)}
              </a>
            </div>
          </div>
        </article>
      `;
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
   Project Preview Modal
   ========================= */

let projectModal = null;
let projectModalContent = null;

function createProjectModal() {
  if (projectModal) return;

  const modalStyle = document.createElement("style");

  modalStyle.id = "project-preview-modal-style";

  modalStyle.textContent = `
    .project-preview-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.72);
      box-sizing: border-box;
    }

    .project-preview-modal.is-open {
      display: flex;
    }

    .project-preview-modal__box {
      position: relative;
      width: min(1100px, 95vw);
      height: min(700px, 90vh);
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    }

    .project-preview-modal__close {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 2;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .project-preview-modal__close:hover {
      background: rgba(0, 0, 0, 0.85);
    }

    .project-preview-modal__content {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      background: #fff;
    }

    .project-preview-modal__fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 14px;
      padding: 30px;
      box-sizing: border-box;
      text-align: center;
      color: #333;
    }

    @media (max-width: 600px) {
      .project-preview-modal {
        padding: 10px;
      }

      .project-preview-modal__box {
        width: 100%;
        height: min(90vh, 650px);
        border-radius: 12px;
      }
    }
  `;

  document.head.appendChild(modalStyle);

  projectModal = document.createElement("div");

  projectModal.className = "project-preview-modal";

  projectModal.setAttribute("role", "dialog");
  projectModal.setAttribute("aria-modal", "true");
  projectModal.setAttribute("aria-label", "معاينة المشروع");

  projectModal.innerHTML = `
    <div class="project-preview-modal__box">

      <button
        type="button"
        class="project-preview-modal__close"
        aria-label="إغلاق"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="project-preview-modal__content"></div>

    </div>
  `;

  document.body.appendChild(projectModal);

  projectModalContent = projectModal.querySelector(
    ".project-preview-modal__content",
  );

  const closeButton = projectModal.querySelector(
    ".project-preview-modal__close",
  );

  closeButton.addEventListener("click", closeProjectModal);

  projectModal.addEventListener("click", (event) => {
    if (event.target === projectModal) {
      closeProjectModal();
    }
  });
}

/* =========================
   تحويل روابط الفيديو
   ========================= */

function normalizeProjectUrl(url) {
  if (!url) return "";

  const trimmedUrl = String(url).trim();

  /* YouTube */

  const youtubeMatch = trimmedUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );

  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
  }

  /* Vimeo */

  const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);

  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return trimmedUrl;
}

/* =========================
   فتح الـ Modal
   ========================= */

function openProjectModal(url, projectName = "المشروع") {
  createProjectModal();

  const projectUrl = normalizeProjectUrl(url);

  if (!projectUrl) {
    projectModalContent.innerHTML = `
      <div class="project-preview-modal__fallback">
        <strong>
          لا يوجد رابط للمعاينة لهذا المشروع.
        </strong>
      </div>
    `;
  } else {
    /* فيديو مباشر */

    const isDirectVideo = /\.(mp4|webm|ogg)(?:\?.*)?$/i.test(projectUrl);

    if (isDirectVideo) {
      projectModalContent.innerHTML = `
        <video
          class="project-preview-modal__content"
          src="${escapeAttribute(projectUrl)}"
          controls
          autoplay
          playsinline
          title="${escapeAttribute(projectName)}"
        ></video>
      `;
    } else {
      /* الموقع / YouTube / Vimeo */

      projectModalContent.innerHTML = `
        <iframe
          class="project-preview-modal__content"
          src="${escapeAttribute(projectUrl)}"
          title="${escapeAttribute(projectName)}"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      `;
    }
  }

  projectModal.classList.add("is-open");

  document.body.style.overflow = "hidden";

  const closeButton = projectModal.querySelector(
    ".project-preview-modal__close",
  );

  closeButton?.focus();
}

/* =========================
   إغلاق الـ Modal
   ========================= */

function closeProjectModal() {
  if (!projectModal) return;

  projectModal.classList.remove("is-open");
  projectModal.querySelector(".project-preview-modal__box")?.classList.remove("is-gallery");
  galleryState = null;

  document.body.style.overflow = "";

  if (projectModalContent) {
    projectModalContent.innerHTML = "";
  }
}

/* =========================
   الضغط على الصورة أو عرض الموقع
   ========================= */

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-project-preview]");

  if (!trigger) return;

  event.preventDefault();
  event.stopPropagation();

  const project = projects.find((item) => item.id === trigger.dataset.projectId);

  if (project?.type === "gallery" && project.images?.length) {
    openProjectGallery(project);
    return;
  }

  openProjectModal(
    trigger.dataset.projectUrl,
    trigger.dataset.projectName || "المشروع",
  );

  /* فيديوهات الموشن الطولية تظهر على خلفية غامقة */
  if (project?.type === "video") {
    projectModal?.querySelector(".project-preview-modal__box")?.classList.add("is-gallery");
  }
});

/* =========================
   معرض الصور (أعمال الجرافيك والسيو)
   ========================= */

let galleryState = null;

function showGalleryImage(index) {
  if (!galleryState) return;
  const { project, img, count } = galleryState;
  const total = project.images.length;
  galleryState.index = (index + total) % total;
  const current = galleryState.index;
  const src = project.images[current];

  img.classList.add("is-swapping");
  const next = new Image();
  next.onload = next.onerror = () => {
    if (!galleryState || galleryState.index !== current) return;
    img.src = src;
    img.alt = `${project.name} - ${current + 1}`;
    img.classList.remove("is-swapping");
  };
  next.src = src;
  count.textContent = `${current + 1} / ${total}`;

  /* تحميل الصورة اللي بعدها مسبقًا */
  new Image().src = project.images[(current + 1) % total];
}

function openProjectGallery(project) {
  createProjectModal();

  const many = project.images.length > 1;
  projectModal.querySelector(".project-preview-modal__box").classList.add("is-gallery");

  projectModalContent.innerHTML = `
    <div class="project-gallery">
      <figure class="project-gallery__stage">
        <img class="project-gallery__img" src="${escapeAttribute(project.images[0])}" alt="${escapeAttribute(project.name)}">
      </figure>
      ${many ? `
      <button type="button" class="project-gallery__nav project-gallery__nav--prev" aria-label="الصورة السابقة"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
      <button type="button" class="project-gallery__nav project-gallery__nav--next" aria-label="الصورة التالية"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>` : ""}
      <div class="project-gallery__bar">
        <strong>${escapeHtml(project.name)}</strong>
        <span class="project-gallery__count"${many ? "" : " hidden"}></span>
      </div>
    </div>
  `;

  galleryState = {
    project,
    index: 0,
    img: projectModalContent.querySelector(".project-gallery__img"),
    count: projectModalContent.querySelector(".project-gallery__count"),
  };
  showGalleryImage(0);

  projectModalContent
    .querySelector(".project-gallery__nav--next")
    ?.addEventListener("click", () => showGalleryImage(galleryState.index + 1));
  projectModalContent
    .querySelector(".project-gallery__nav--prev")
    ?.addEventListener("click", () => showGalleryImage(galleryState.index - 1));

  /* السحب بالإصبع على الجوال (الصفحة من اليمين لليسار) */
  const stage = projectModalContent.querySelector(".project-gallery__stage");
  let startX = null;
  stage.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (startX === null || !many) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) showGalleryImage(galleryState.index + (dx > 0 ? 1 : -1));
    startX = null;
  });

  projectModal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  projectModal.querySelector(".project-preview-modal__close")?.focus();
}

document.addEventListener("keydown", (event) => {
  if (!galleryState || !projectModal?.classList.contains("is-open")) return;
  if (event.key === "ArrowLeft") showGalleryImage(galleryState.index + 1);
  if (event.key === "ArrowRight") showGalleryImage(galleryState.index - 1);
});

/* =========================
   إغلاق بـ ESC
   ========================= */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectModal?.classList.contains("is-open")) {
    closeProjectModal();
  }
});
(function () {
  "use strict";

  /* رقم Judy بدون + أو مسافات */
  const WHATSAPP = "966552261549";

  const root = document.getElementById("judy-store-quiz");
  if (!root) return;

  const modal = root.querySelector(".jsq-modal");
  const overlay = root.querySelector(".jsq-overlay");
  const launcher = root.querySelector(".jsq-launcher");
  const closeBtn = root.querySelector(".jsq-close");
  const progress = root.querySelector(".jsq-progress span");
  const whatsappBtn = root.querySelector("#jsq-whatsapp");
  const summaryBox = root.querySelector("#jsq-summary");

  const answers = {
    stage: null,
    need: null,
    goal: null,
  };

  let currentStep = "intro";

  const labels = {
    stage: {
      new: "أبدأ متجري من الصفر",
      existing: "عندي متجر وأبي أرتّبه وأطوّره",
      sales: "متجري جاهز لكن مبيعاته ضعيفة",
    },
    need: {
      design: "تصميم واجهة احترافية للمتجر",
      content: "محتوى ووصف منتجات مقنع",
      conversion: "تحسين تجربة العميل وزيادة التحويل",
      seo: "تحسين ظهور المتجر في محركات البحث SEO",
    },
    goal: {
      launch: "إطلاق متجر يليق بالعلامة",
      trust: "زيادة الثقة والاحترافية",
      growth: "زيادة الطلبات والمبيعات",
      visibility: "الوصول لعملاء جدد",
    },
  };

  const results = {
    new: {
      title: "باقة إطلاق المتجر",
      text: "أنت تحتاج بداية مرتبة تبني الثقة من أول زيارة.",
      items: [
        "تصميم متجر احترافي ومتجاوب",
        "تنظيم الأقسام والصفحات الأساسية",
        "تهيئة تجربة العميل للشراء",
      ],
    },
    existing: {
      title: "باقة تطوير وتحسين المتجر",
      text: "متجرك يحتاج ترتيبًا بصريًا وتجربة أسهل وأكثر احترافية للعميل.",
      items: [
        "إعادة تصميم الواجهة",
        "تحسين رحلة المستخدم",
        "مراجعة الصفحات والعناصر المهمة",
      ],
    },
    sales: {
      title: "باقة رفع التحويل والمبيعات",
      text: "الفرصة الأكبر عندك هي تحويل الزيارات الحالية إلى طلبات أكثر.",
      items: [
        "تحسين صفحات المنتجات",
        "تقوية المحتوى والعروض",
        "تحسين نقاط الإقناع وأزرار الشراء",
      ],
    },
    design: {
      title: "تصميم متجر احترافي",
      text: "سنحوّل هوية علامتك إلى واجهة مرتبة تليق بمنتجاتك.",
      items: [
        "تصميم متجاوب للجوال",
        "تنسيق الألوان والأقسام",
        "واجهة واضحة وسهلة التصفح",
      ],
    },
    content: {
      title: "محتوى متجر يبيع",
      text: "المحتوى المناسب يشرح القيمة ويقرّب العميل من قرار الشراء.",
      items: [
        "وصف منتجات مقنع",
        "عناوين تسويقية واضحة",
        "صياغة صفحات المتجر الأساسية",
      ],
    },
    conversion: {
      title: "تحسين تجربة العميل",
      text: "سنراجع نقاط التردد ونبسط الطريق من التصفح إلى الشراء.",
      items: [
        "تحليل رحلة العميل",
        "تحسين بنية الصفحات",
        "تقوية نقاط الإقناع والدعوة للشراء",
      ],
    },
    seo: {
      title: "تهيئة المتجر لمحركات البحث",
      text: "سنساعد متجرك على الظهور أمام العملاء الباحثين عن منتجاتك.",
      items: [
        "تحسين العناوين والأوصاف",
        "تنظيم المحتوى والكلمات المفتاحية",
        "تهيئة صفحات المنتجات",
      ],
    },
    launch: {
      title: "باقة إطلاق المتجر",
      text: "الهدف واضح: متجر يترك انطباعًا احترافيًا من أول زيارة.",
      items: [
        "هوية وواجهة متناسقة",
        "إعداد الصفحات المهمة",
        "تجهيز المتجر للانطلاق",
      ],
    },
    trust: {
      title: "باقة بناء الثقة",
      text: "سنقوّي حضور المتجر ونوضح للعميل لماذا يختارك.",
      items: [
        "تصميم أكثر احترافية",
        "محتوى يجيب عن أسئلة العميل",
        "إبراز المزايا وعناصر الثقة",
      ],
    },
    growth: {
      title: "باقة النمو والمبيعات",
      text: "سنركّز على العناصر التي تساعدك على زيادة الطلبات.",
      items: ["تحسين التحويل", "محتوى عروض وتسويق", "تجربة شراء أكثر سلاسة"],
    },
    visibility: {
      title: "باقة الظهور والوصول",
      text: "سنرتب المحتوى ليصل متجرك إلى عملاء جدد.",
      items: [
        "أساسيات SEO للمتجر",
        "تحسين صفحات المنتجات",
        "خطة محتوى قابلة للتنفيذ",
      ],
    },
  };

  function openQuiz() {
    modal.hidden = false;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    showStep("intro");
  }

  function closeQuiz() {
    modal.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function showStep(step) {
    root.querySelectorAll(".jsq-step").forEach((el) => {
      el.classList.remove("is-active");
    });

    const target = root.querySelector('[data-step="' + step + '"]');
    if (target) target.classList.add("is-active");

    currentStep = step;

    const width =
      step === "intro" ? 0 : step === "result" ? 100 : (Number(step) / 3) * 100;

    progress.style.width = width + "%";
  }

  function getRecommendedResult() {
    /*
        الأولوية للحالة الحالية لأنها أهم مؤشر للخدمة.
        وإذا لم توجد، نستخدم الاحتياج أو الهدف.
      */
    return (
      results[answers.stage] ||
      results[answers.need] ||
      results[answers.goal] ||
      results.existing
    );
  }

  function buildWhatsAppMessage(result) {
    return [
      "مرحبًا Judy Marketing، أريد الاستفسار عن خدماتكم لمتجري.",
      "",
      "إجابات مساعد اختيار الخدمة:",
      "1) حالة المتجر: " + (labels.stage[answers.stage] || "غير محدد"),
      "2) الاحتياج الأساسي: " + (labels.need[answers.need] || "غير محدد"),
      "3) الهدف الحالي: " + (labels.goal[answers.goal] || "غير محدد"),
      "",
      "الخدمة المقترحة: " + result.title,
      "",
      "أرغب بمعرفة التفاصيل والأسعار المناسبة لحالتي.",
    ].join("\n");
  }

  function showResult() {
    const result = getRecommendedResult();

    root.querySelector("#jsq-result-title").textContent = result.title;
    root.querySelector("#jsq-result-text").textContent = result.text;

    root.querySelector("#jsq-result-list").innerHTML = result.items
      .map((item) => "<div>" + escapeHtml(item) + "</div>")
      .join("");

    summaryBox.innerHTML = `
      <strong>ملخص إجاباتك</strong><br>
      حالة المتجر: ${escapeHtml(labels.stage[answers.stage] || "غير محدد")}<br>
      الاحتياج: ${escapeHtml(labels.need[answers.need] || "غير محدد")}<br>
      الهدف: ${escapeHtml(labels.goal[answers.goal] || "غير محدد")}
    `;

    const message = encodeURIComponent(buildWhatsAppMessage(result));

    whatsappBtn.href = "https://wa.me/" + WHATSAPP + "?text=" + message;

    showStep("result");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  launcher.addEventListener("click", openQuiz);
  closeBtn.addEventListener("click", closeQuiz);
  overlay.addEventListener("click", closeQuiz);

  root.querySelector('[data-next="1"]').addEventListener("click", function () {
    showStep("1");
  });

  root.querySelectorAll(".jsq-options button").forEach((button) => {
    button.addEventListener("click", function () {
      if (currentStep === "1") {
        answers.stage = this.dataset.answer;
        showStep("2");
        return;
      }

      if (currentStep === "2") {
        answers.need = this.dataset.answer;
        showStep("3");
        return;
      }

      if (currentStep === "3") {
        answers.goal = this.dataset.answer;
        showResult();
      }
    });
  });

  root.querySelector(".jsq-restart").addEventListener("click", function () {
    answers.stage = null;
    answers.need = null;
    answers.goal = null;
    showStep("intro");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      closeQuiz();
    }
  });
})();
/* =========================
   Initial loading
========================= */

loadProjects();
loadTestimonials();
