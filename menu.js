let cachedMenuData = [];

const menuContainer = document.getElementById("menu-container");

const categoryLabels = {
  soup:      "Перші страви",
  breakfast: "Сніданки",
  main:      "Гарячі страви",
  salad:     "Салати",
  pasta:     "Паста",
  appetizer: "Закуски",
  dessert:   "Солодощі"
};

const categoryOrder = ["soup","breakfast","main","salad","pasta","appetizer","dessert"];

const fetchMenuFromServer = async () => {
  menuContainer.innerHTML = `
    <div class="loader-box">
      <div class="spinner"></div>
      <p>Отримання даних із сервера...</p>
    </div>
  `;

  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    const response = await fetch("menu.json");
    if (!response.ok) throw new Error(`Помилка сервера: статус ${response.status}`);
    cachedMenuData = await response.json();
    renderMenuDOM(cachedMenuData);
  } catch (error) {
    menuContainer.innerHTML = `<p class="menu-error">Не вдалося завантажити меню: ${error.message}</p>`;
    console.error(error);
  }
};

const renderDish = ({ title, price, weight, description, image, recommended }) => {
  const imgBlock = image
    ? `<img src="${image}" alt="${title}" class="menu-item-img">`
    : `<div class="menu-item-img-placeholder"></div>`;

  const rec = recommended ? `<span class="menu-recommended">Рекомендовано</span>` : "";
  const wt  = weight     ? `<span class="menu-weight">⚖ ${weight}</span>` : "";
  const desc = description ? `<p class="menu-item-desc">${description}</p>` : "";

  return `
    <article class="menu-item">
      <div class="menu-item-info">
        <h3 class="menu-item-title">${title}</h3>
        <p class="menu-item-price">${price} ₴</p>
        ${desc}
        <div class="menu-item-meta">${wt}${rec}</div>
      </div>
      <div class="menu-item-photo">${imgBlock}</div>
    </article>
  `;
};

const renderMenuDOM = (dishes) => {
  if (dishes.length === 0) {
    menuContainer.innerHTML = `<p class="menu-empty">У цій категорії наразі немає страв.</p>`;
    return;
  }

  const selectedCategory = document.querySelector(".filter-btn.active")?.dataset.category;

  if (selectedCategory && selectedCategory !== "all") {
    menuContainer.innerHTML = dishes.map(renderDish).join("");
    return;
  }

  // Групуємо по категоріях у правильному порядку
  const grouped = {};
  dishes.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  menuContainer.innerHTML = categoryOrder
    .filter(cat => grouped[cat])
    .map(cat => `
      <section class="menu-category">
        <h2 class="menu-category-title">${categoryLabels[cat]}</h2>
        ${grouped[cat].map(renderDish).join("")}
      </section>
    `).join("");
};

const initCategoryFilters = () => {
  const filtersParent = document.getElementById("filters-parent");
  if (!filtersParent) return;

  filtersParent.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;

    filtersParent.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedCategory = button.dataset.category;
    const filtered = selectedCategory === "all"
      ? cachedMenuData
      : cachedMenuData.filter(d => d.category === selectedCategory);

    renderMenuDOM(filtered);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  fetchMenuFromServer();
  initCategoryFilters();
});
