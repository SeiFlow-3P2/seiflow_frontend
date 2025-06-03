
document.addEventListener("DOMContentLoaded", async () => {
  const authForm = document.getElementById("auth-form");
  const errorMessage = document.getElementById("error-message");
  const submitButton = document.getElementById("submit-button");
  const loginTab = document.getElementById("login-tab");
  const signupTab = document.getElementById("signup-tab");
  const formTitle = document.getElementById("form-title");
  let isLoginMode = true;

  // Проверка здоровья сервиса(не шарю за это тему все ломает без ручки Health check)
  // async function checkHealth() {
  //   try {
  //     const response = await fetch("http://localhost:8080/v1/auth/health");
  //     if (!response.ok) throw new Error(`Сервис недоступен: ${response.status}`);
  //   } catch (error) {
  //     console.error("Ошибка проверки здоровья:", error);
  //     errorMessage.textContent = "Сервис временно недоступен. Попробуйте позже.";
  //     errorMessage.style.display = "block";
  //     submitButton.disabled = true;
  //   }
  // }

  // Переключение вкладок
  loginTab.addEventListener("click", () => {
    isLoginMode = true;
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    formTitle.textContent = "Вход";
    submitButton.textContent = "Войти";
    errorMessage.style.display = "none";
  });

  signupTab.addEventListener("click", () => {
    isLoginMode = false;
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    formTitle.textContent = "Регистрация";
    submitButton.textContent = "Зарегистрироваться";
    errorMessage.style.display = "none";
  });

  // Обработка формы
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();

    // Валидация
    if (!email || !password) {
      errorMessage.textContent = "Пожалуйста, заполните все поля.";
      errorMessage.style.display = "block";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMessage.textContent = "Некорректный формат email.";
      errorMessage.style.display = "block";
      return;
    }
    if (password.length < 8) {
      errorMessage.textContent = "Пароль должен содержать минимум 8 символов.";
      errorMessage.style.display = "block";
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = isLoginMode ? "Вход..." : "Регистрация...";

      const endpoint = isLoginMode ? "/v1/auth/signin" : "/v1/auth/signup";
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      window.location.href = "dashboard-page.html";
    } catch (error) {
      console.error(`Ошибка при ${isLoginMode ? "входе" : "регистрации"}:`, error);
      errorMessage.textContent = error.message || `Не удалось ${isLoginMode ? "войти" : "зарегистрироваться"}. Попробуйте снова.`;
      errorMessage.style.display = "block";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = isLoginMode ? "Войти" : "Зарегистрироваться";
    }
  });

  // await checkHealth();
});
