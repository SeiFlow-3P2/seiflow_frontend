document.addEventListener("DOMContentLoaded", () => {
  // Инициализация Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Установка дефолтной темной темы при первой загрузке, если нет сохраненной
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
  }

  const savedTheme = localStorage.getItem("theme");
  const themeIcon = document.getElementById("theme-icon");
  const themeToggle = document.getElementById("theme-toggle");

  // Проверка наличия элементов
  if (!themeIcon || !themeToggle) {
    console.warn("Theme switcher elements not found on this page.");
    return; // Прекращаем выполнение, если элементы не найдены
  }

  // Применение сохраненной темы
  if (savedTheme === "light") {
    document.body.setAttribute("data-theme", "light");
    themeIcon.setAttribute("data-lucide", "moon"); // Луна при светлой теме
  } else {
    document.body.setAttribute("data-theme", "dark");
    themeIcon.setAttribute("data-lucide", "sun"); // Солнце при темной теме
  }
  lucide.createIcons(); // Переинициализация иконок

  // Обработчик переключения темы
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") || "dark";
    if (currentTheme === "dark") {
      document.body.setAttribute("data-theme", "light");
      themeIcon.setAttribute("data-lucide", "moon"); // Луна при светлой теме
      localStorage.setItem("theme", "light");
    } else {
      document.body.setAttribute("data-theme", "dark");
      themeIcon.setAttribute("data-lucide", "sun"); // Солнце при темной теме
      localStorage.setItem("theme", "dark");
    }
    // Переинициализация иконок после изменения
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });
});
