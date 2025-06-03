
document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");
  const confirmPasswordInput = document.getElementById("confirm-password-input");
  const confirmPasswordWrapper = document.getElementById("confirm-password-wrapper");
  const submitButton = document.getElementById("submit-button");
  const errorMessage = document.getElementById("error-message");
  const loginTab = document.getElementById("login-tab");
  const signupTab = document.getElementById("signup-tab");
  const formTitle = document.getElementById("form-title");
  const togglePassword = document.getElementById("toggle-password");
  const toggleConfirmPassword = document.getElementById("toggle-confirm-password");

  // Mock login credentials (for testing purposes)
  const MOCK_EMAIL = "test@example.com";
  const MOCK_PASSWORD = "password123";

  // State to track current mode (login or signup)
  let isLoginMode = true;

  // Toggle password visibility
  const setupPasswordToggle = (toggleBtn, passwordField) => {
    if (toggleBtn && passwordField) {
      toggleBtn.addEventListener("click", () => {
        const type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;
        toggleBtn.textContent = type === "password" ? "Показать" : "Скрыть";
      });
    }
  };

  setupPasswordToggle(togglePassword, passwordInput);
  setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

  // Tab switching logic
  const switchToLogin = () => {
    isLoginMode = true;
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginTab.setAttribute("aria-selected", "true");
    signupTab.setAttribute("aria-selected", "false");
    formTitle.textContent = "Вход";
    submitButton.textContent = "Войти";
    confirmPasswordWrapper.style.display = "none";
    confirmPasswordInput.style.display = "none";
    toggleConfirmPassword.style.display = "none";
    confirmPasswordInput.required = false;
    errorMessage.style.display = "none";
  };

  const switchToSignup = () => {
    isLoginMode = false;
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupTab.setAttribute("aria-selected", "true");
    loginTab.setAttribute("aria-selected", "false");
    formTitle.textContent = "Регистрация";
    submitButton.textContent = "Зарегистрироваться";
    confirmPasswordWrapper.style.display = "block";
    confirmPasswordInput.style.display = "block";
    toggleConfirmPassword.style.display = "inline-block";
    confirmPasswordInput.required = true;
    errorMessage.style.display = "none";
  };

  loginTab.addEventListener("click", switchToLogin);
  signupTab.addEventListener("click", switchToSignup);

  // Add keyboard navigation for tabs
  [loginTab, signupTab].forEach((tab, index) => {
    tab.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tab.click();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const nextTab = index === 0 ? signupTab : loginTab;
        nextTab.focus();
        nextTab.click();
      }
    });
  });

  // Handle form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      const confirmPassword = confirmPasswordInput?.value.trim();

      if (!email || !password) {
        errorMessage.textContent = "Заполните все обязательные поля!";
        errorMessage.style.display = "block";
        return;
      }

      if (!isLoginMode && password !== confirmPassword) {
        errorMessage.textContent = "Пароли не совпадают!";
        errorMessage.style.display = "block";
        return;
      }

      if (submitButton) submitButton.disabled = true;

      try {
        if (isLoginMode) {
          // Login mode
          if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
            console.log("Mock-режим: успешный вход");
            localStorage.setItem(config.auth.tokenKey, config.auth.mockToken);
            localStorage.setItem("refreshToken", "mock-refresh-token-67890");
            window.location.href = config.paths.boards;
            return;
          }

          const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.login}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ошибка входа");
          }

          const data = await response.json();
          localStorage.setItem(config.auth.tokenKey, data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);
          console.log("Успешный вход");
          window.location.href = config.paths.boards;
        } else {
          // Signup mode
          const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.signup}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ошибка регистрации");
          }

          const data = await response.json();
          localStorage.setItem(config.auth.tokenKey, data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);
          console.log("Успешная регистрация");
          window.location.href = config.paths.boards;
        }
      } catch (error) {
        console.error(`Ошибка ${isLoginMode ? "входа" : "регистрации"}:`, error.message);
        errorMessage.textContent =
          error.message === "Failed to fetch"
            ? "Сервер недоступен, попробуйте позже"
            : error.message || `Неверный email или пароль`;
        errorMessage.style.display = "block";
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // Auto-redirect if already logged in
  const token = localStorage.getItem(config.auth.tokenKey);
  if (token) {
    window.location.href = config.paths.boards;
  }
});
