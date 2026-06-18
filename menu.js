// Глобальна змінна для збереження завантажених з JSON даних
let cachedMenuData = [];

const menuContainer = document.getElementById("menu-container");

// 1 & 3. Завантаження меню з menu.json за допомогою Fetch API та імітація затримки setTimeout
const fetchMenuFromServer = async () => {
  // Відображаємо індикатор завантаження у DOM
  menuContainer.innerHTML = `
    <div class="loader-box">
      <div class="spinner"></div>
      <p>Отримання даних із сервера...</p>
    </div>
  `;

  try {
    // Імітуємо затримку сервера в 1 секунду за допомогою setTimeout всередині Promise
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Виконуємо реальний Fetch-запит до локального JSON-файлу
    const response = await fetch("menu.json");
    
    if (!response.ok) {
      throw new Error(`Помилка сервера: статус ${response.status}`);
    }

    // Парсимо отримані дані у форматі JSON
    cachedMenuData = await response.json();
    
    // Відображаємо всі страви після успішного завантаження
    renderMenuDOM(cachedMenuData);

  } catch (error) {
    menuContainer.innerHTML = `<p class="menu-error">Не вдалося завантажити меню: ${error.message}</p>`;
    console.error(error);
  }
};

// Функція для динамічної зміни DOM та рендерингу карток страв
const renderMenuDOM = (dishes) => {
  if (dishes.length === 0) {
    menuContainer.innerHTML = `<p class="menu-empty">У цій категорії наразі немає страв.</p>`;
    return;
  }

  // Заповнюємо контейнер HTML-картками страв з JSON-структури
  menuContainer.innerHTML = dishes.map(({ title, price, description }) => `
    <article class="menu-item">
      <div class="menu-item-info">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <span class="menu-item-price" style="--price-align: flex-end;">${price} ₴</span>
    </article>
  `).join("");
};

// 2. Реалізація фільтрації за категоріями
const initCategoryFilters = () => {
  const filtersParent = document.getElementById("filters-parent");

  if (!filtersParent) return;

  // Використовуємо делегування подій (з ЛР №5)
  filtersParent.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;

    // Візуальна зміна активної кнопи
    filtersParent.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedCategory = button.dataset.category;

    // Фільтруємо вже збережені серверні дані
    if (selectedCategory === "all") {
      renderMenuDOM(cachedMenuData);
    } else {
      const filtered = cachedMenuData.filter(dish => dish.category === selectedCategory);
      renderMenuDOM(filtered);
    }
  });
};

// Запуск асинхронного ланцюжка після завантаження структури сторінки
document.addEventListener("DOMContentLoaded", () => {
  fetchMenuFromServer(); // Запускаємо Fetch-запит до menu.json
  initCategoryFilters(); // Активуємо фільтрацію
});