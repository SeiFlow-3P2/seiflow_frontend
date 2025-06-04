
const config = {
  // API Settings: Конфигурация API, включая базовый URL и эндпоинты для различных ресурсов.
  // Используется для формирования запросов к серверу.
  api: {
    // Базовый URL для всех API-запросов. Значение по умолчанию берётся из window.env, если не задано — используется localhost.
    baseUrl: window.env?.API_BASE_URL || "http://localhost:8080/v1",
    // Эндпоинты API, сгруппированные по ресурсам (доски, колонки, задачи, авторизация, календарь).
    endpoints: {
      // Доски: Эндпоинты для работы с досками (список, создание, получение, обновление).
      boards: {
        list: "/boards", // Получение списка всех досок.
        create: "/boards", // Создание новой доски.
        get: (boardId) => `/boards/${boardId}`, // Получение данных конкретной доски по ID.
        update: (boardId) => `/boards/${boardId}`, // Обновление данных доски по ID.
      },
      // Колонки: Эндпоинты для управления колонками на досках.
      columns: {
        create: (boardId) => `/boards/${boardId}/columns`, // Создание новой колонки на доске.
        update: (columnId) => `/columns/${columnId}`, // Обновление данных колонки по ID.
        delete: (columnId) => `/columns/${columnId}`, // Удаление колонки по ID.
      },
      // Задачи: Эндпоинты для управления задачами в колонках.
      tasks: {
        create: (columnId) => `/columns/${columnId}/tasks`, // Создание новой задачи в колонке.
        update: (taskId) => `/tasks/${taskId}`, // Обновление данных задачи по ID.
        delete: (taskId) => `/tasks/${taskId}`, // Удаление задачи по ID.
        move: (taskId, newColumnId) => `/tasks/${taskId}/move?newColumnId=${newColumnId}`, // Перемещение задачи в другую колонку.
      },
      // Авторизация: Эндпоинты для управления сессиями пользователя.
      auth: {
        login: "/auth/login", // Аутентификация пользователя (вход).
        signup: "/auth/signup", // Регистрация нового пользователя.
        refresh: "/auth/refresh", // Обновление токена доступа.
        logout: "/auth/logout", // Выход из системы (завершение сессии).
      },
      // Календарь: Эндпоинты для работы с событиями в календаре.
      calendar: {
        events: (calendarId) => `/calendars/${calendarId}/events`, // Получение списка событий в календаре.
        event: (eventId) => `/events/${eventId}`, // Получение/управление конкретным событием по ID.
      },
    },
  },

  // Authentication Settings: Настройки, связанные с авторизацией и аутентификацией пользователя.
  auth: {
    tokenKey: "authToken", // Ключ для хранения токена доступа в localStorage.
    mockToken: window.env?.MOCK_TOKEN || "mock-token", // Токен для mock-режима, используемый в тестовой среде.
    // Проверка, является ли текущая среда тестовой (локальной).
    isDevEnvironment: () =>
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port === "8080",
    loginRedirect: () => config.paths.login, // Путь для редиректа на страницу логина при отсутствии токена.
  },

  // Local Storage Keys: Ключи для хранения данных в localStorage.
  storage: {
    resources: (boardId) => `board-${boardId}-resources`, // Ключ для хранения ресурсов доски (например, прикреплённых файлов).
    tasks: (boardId) => `board-${boardId}-tasks`, // Ключ для хранения задач доски (например, для оффлайн-режима).
    settings: "user-settings", // Ключ для хранения пользовательских настроек.
  },

  // Page Paths: Пути к страницам приложения.
  paths: {
    login: "/login.html", // Страница входа/регистрации.
    boards: "/dashboard-page.html", // Страница со списком всех досок.
    board: (boardId) => `/board.html?boardId=${boardId}`, // Страница конкретной доски с передачей ID в параметрах.
    calendar: "/calendar-page.html", // Страница календаря.
  },

  // UI Settings: Настройки, связанные с пользовательским интерфейсом.
  ui: {
    defaultEventColor: "#4CAF50", // Цвет по умолчанию для событий в календаре.
    // Настройки для библиотеки Lucide (иконки).
    lucide: {
      // Инициализация иконок Lucide с возможностью указания контейнера.
      initialize: (options = {}) => {
        const { container } = options;
        if (typeof lucide !== "undefined" && lucide.createIcons) {
          lucide.createIcons({ ...options, elements: container ? container.querySelectorAll("[data-lucide]") : undefined });
        } else {
          console.warn("Lucide library not loaded");
        }
      },
    },
  },

  // Utility Functions: Утилитарные функции для общего использования в приложении.
  utils: {
    // Очистка пользовательского ввода для предотвращения XSS-атак.
    sanitizeInput: (input) => {
      if (typeof input !== "string") return "";
      const div = document.createElement("div");
      div.textContent = input.slice(0, 1000); // Ограничение длины для защиты от переполнения.
      return div.innerHTML;
    },
    // Получение заголовков для авторизованных запросов.
    getAuthHeaders: () => {
      const token = localStorage.getItem(config.auth.tokenKey);
      const useMockToken = config.auth.isDevEnvironment() && !token;

      if (!token && !useMockToken) {
        return { error: "No auth token available", redirect: config.auth.loginRedirect() };
      }

      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || config.auth.mockToken}`,
      };
    },
    // Обработка ответа от API с проверкой статус-кодов.
    handleResponse: async (response) => {
      if (response.status === 401) {
        console.warn("Unauthorized request, redirecting to login");
        localStorage.removeItem(config.auth.tokenKey);
        alert("Сессия истекла. Пожалуйста, войдите снова.");
        window.location.href = config.auth.loginRedirect();
        throw new Error("Unauthorized");
      }
      if (response.status >= 400) {
        const error = await response.text();
        console.error(`HTTP error ${response.status}: ${error}`);
        throw new Error(`HTTP error ${response.status}: ${error}`);
      }
      if (response.status === 204) return {};
      return response.json();
    },
    // Преобразование даты в формат RFC3339 (ISO 8601).
    toRFC3339: (date) => (date instanceof Date ? date.toISOString() : new Date().toISOString()),
    // Парсинг строки RFC3339 в объект Date.
    fromRFC3339: (str) => (str ? new Date(str) : new Date()),
    // Генерация уникального ID с префиксом.
    generateId: (prefix) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  },
};

// Export for module usage (if using ES modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
} else {
  window.config = config; // Global variable for browser
}
