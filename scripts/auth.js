// Выполняет авторизованный запрос с автоматическим обновлением токена
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem(config.auth.tokenKey);
  if (!accessToken) {
    window.location.href = config.paths.login;
    throw new Error("Токен отсутствует");
  }

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    console.log(`Отправка авторизованного запроса на: ${url}`);
    const response = await fetch(url, options);
    if (response.status === 401) {
      console.log("Получен 401, пытаемся обновить токен...");
      if (accessToken === config.auth.mockToken) {
        console.warn("Mock-токен, пропускаем обновление");
        throw new Error("Mock-режим: обновление токена невозможно");
      }
      const newTokens = await refreshToken();
      options.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      console.log("Повторный запрос с новым токеном");
      return fetch(url, options);
    }
    return response;
  } catch (error) {
    console.error("Ошибка запроса:", error.message);
    if (error.message.includes("Failed to fetch")) {
      console.warn("Сервер недоступен, работа в mock-режиме");
      throw new Error("Сервер недоступен, используйте mock-режим");
    }
    if (
      error.message === "Токен отсутствует" ||
      error.message.includes("Mock-режим")
    ) {
      throw error;
    }
    throw new Error("Не удалось выполнить запрос");
  }
}

// Обновление токена
async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    localStorage.removeItem(config.auth.tokenKey);
    window.location.href = config.paths.login;
    throw new Error("Refresh токен отсутствует");
  }

  if (refreshToken === "mock-refresh-token-67890") {
    console.warn("Mock-режим: обновление токена невозможно");
    throw new Error("Mock-режим: обновление токена невозможно");
  }

  try {
    console.log("Обновление токена...");
    const response = await fetch(
      `${config.api.baseUrl}${config.api.endpoints.auth.refresh}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      console.error(`Ошибка обновления токена: ${response.status}`);
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem("refreshToken");
      window.location.href = config.paths.login;
      throw new Error("Не удалось обновить токен");
    }

    const data = await response.json();
    localStorage.setItem(config.auth.tokenKey, data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    console.log("Токены обновлены");
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (error) {
    console.error("Ошибка обновления токена:", error.message);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Сервер недоступен для обновления токена");
    }
    throw error;
  }
}

// Выход из системы
async function logout() {
  const accessToken = localStorage.getItem(config.auth.tokenKey);
  try {
    if (accessToken !== config.auth.mockToken) {
      console.log("Выполнение выхода...");
      await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.logout}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: "mock-user-id" }), // Заглушка для user_id
      });
      console.log("Выход выполнен");
    } else {
      console.log("Mock-режим: пропускаем запрос на logout");
    }
  } catch (error) {
    console.error("Ошибка при выходе:", error.message);
  } finally {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem("refreshToken");
    console.log("Перенаправление на index.html");
    window.location.href = config.paths.index;
  }
}

export { fetchWithAuth, logout };
