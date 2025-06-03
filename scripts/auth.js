// Выполняет авторизованный запрос с автоматическим обновлением токена
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    window.location.href = "login-page.html";
    throw new Error("Токен отсутствует");
  }

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, options);
    if (response.status === 401) {
      // Пробуем обновить токен
      const newTokens = await refreshToken();
      options.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return fetch(url, options); // Повторяем запрос
    }
    return response;
  } catch (error) {
    console.error("Ошибка запроса:", error);
    if (error.message === "Токен отсутствует") throw error;
    throw new Error("Не удалось выполнить запрос");
  }
}

// Обновление токена
async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    window.location.href = "login-page.html";
    throw new Error("Refresh токен отсутствует");
  }

  try {
    const response = await fetch("http://localhost:8080/v1/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "login-page.html";
      throw new Error("Не удалось обновить токен");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    throw error;
  }
}

// Выход из системы
async function logout() {
  const accessToken = localStorage.getItem("accessToken");
  try {
    await fetch("http://localhost:8080/v1/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Ошибка при выходе:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "index.html";
  }
}

export { fetchWithAuth, logout };
