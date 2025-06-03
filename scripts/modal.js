document.addEventListener("DOMContentLoaded", () => {
  if (!window.lucide || typeof window.lucide.createIcons !== "function") {
    console.error("Lucide не загружен или createIcons недоступен.");
    return;
  }

  try {
    lucide.createIcons();
    console.log("Иконки Lucide инициализированы");
  } catch (error) {
    console.error("Ошибка при инициализации Lucide:", error);
  }

  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  const API_BASE_URL = "http://localhost:8080/v1";
  const USER_ID = "user123"; // TODO: Заменить на реальный ID пользователя

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || "mock-token";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error ${response.status}: ${error}`);
    }
    if (response.status === 204) return {};
    return response.json();
  };

  const newBoardButton = document.getElementById("newBoardButton");
  const modal = document.getElementById("newBoardModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const newBoardForm = document.getElementById("newBoardForm");
  const categoryButtons = document.querySelectorAll(".modal-category-button");
  const methodologyButtons = document.querySelectorAll(".methodology-button");
  const boardCategoryInput = document.getElementById("boardCategory");
  const boardMethodologyInput = document.getElementById("boardMethodology");
  const boardsGrid = document.getElementById("boardsGrid");

  const categoryIcons = {
    learning: "book-open",
    health: "heart",
    finance: "bar-chart-2",
    personal: "user",
  };

  const categoryColors = {
    learning: "yellow-icon",
    health: "red-icon",
    finance: "green-icon",
    personal: "blue-icon",
  };

  const renderBoards = async () => {
    if (!boardsGrid) {
      console.error("Ошибка: элемент #boardsGrid не найден");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      const boards = data.boards || [];

      boardsGrid.innerHTML = "";
      boards.forEach((board) => {
        const categoryText =
          {
            learning: "Обучение",
            health: "Здоровье",
            finance: "Финансы",
            personal: "Личное",
          }[board.category] || "Обучение";
        const methodologyText =
          { none: "Без методологии", scrum: "Scrum" }[board.methodology] ||
          "Без методологии";

        const newBoard = document.createElement("div");
        newBoard.classList.add("board-card");
        newBoard.dataset.boardId = board.id;
        newBoard.dataset.category = categoryText;
        newBoard.innerHTML = `
          <div class="board-card-content">
            <div class="board-card-header">
              <div class="board-icon-container">
                <i data-lucide="${
                  categoryIcons[board.category] || "book-open"
                }" class="${
          categoryColors[board.category] || "yellow-icon"
        }" aria-hidden="true"></i>
              </div>
              <div class="board-actions">
                <button class="board-favorite-button" aria-label="Добавить в избранное">
                  <i data-lucide="star" class="${
                    board.favorite ? "favorite-active" : ""
                  }" aria-hidden="true"></i>
                </button>
                <button class="board-action-button" aria-label="Открыть меню действий для доски '${sanitizeInput(
                  board.name
                )}'">
                  <i data-lucide="more-vertical" aria-hidden="true"></i>
                </button>
                <div class="more-options-menu">
                  <button class="more-options-item delete-board">
                    <i data-lucide="trash-2" class="dropdown-icon" aria-hidden="true"></i>
                    Удалить доску
                  </button>
                </div>
              </div>
            </div>
            <h3 class="board-title">${
              sanitizeInput(board.name) || "Новая доска"
            }</h3>
            <p class="board-description">${
              sanitizeInput(board.description) || "Нет описания"
            }</p>
            <div class="board-methodology">Методология: ${sanitizeInput(
              methodologyText
            )}</div>
            <div class="board-progress">
              <div class="progress-info">
                <span>${sanitizeInput(board.progress + "%")}</span>
                <span>100%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${sanitizeInput(
                  board.progress
                )}%;"></div>
              </div>
            </div>
            <div class="board-last-edited">Последнее редактирование: ${sanitizeInput(
              new Date(board.updated_at).toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            )}</div>
          </div>
        `;
        boardsGrid.appendChild(newBoard);
      });

      const newBoardCardElement = document.createElement("div");
      newBoardCardElement.classList.add("new-board-card");
      newBoardCardElement.id = "newBoardCard";
      newBoardCardElement.innerHTML = `
        <div class="new-board-icon">
          <i data-lucide="plus" aria-hidden="true"></i>
        </div>
        <h3>Создать новую доску</h3>
        <p>Добавьте персонализированную доску для любых целей</p>
      `;
      boardsGrid.appendChild(newBoardCardElement);

      lucide.createIcons({ container: boardsGrid });
    } catch (error) {
      console.error("Ошибка при загрузке досок:", error);
      boardsGrid.innerHTML = "<p>Ошибка загрузки досок. Попробуйте позже.</p>";
    }
  };

  newBoardButton?.addEventListener("click", () => {
    modal.style.display = "flex";
    document.getElementById("boardTitle").focus();
  });

  boardsGrid?.addEventListener("click", async (event) => {
    const newBoardCard = event.target.closest("#newBoardCard");
    const deleteButton = event.target.closest(".delete-board");
    const favoriteButton = event.target.closest(".board-favorite-button");
    const actionButton = event.target.closest(".board-action-button");

    if (newBoardCard) {
      modal.style.display = "flex";
      document.getElementById("boardTitle").focus();
    }

    if (deleteButton) {
      const boardCard = deleteButton.closest(".board-card");
      const boardId = boardCard.dataset.boardId;
      if (confirm("Вы уверены, что хотите удалить эту доску?")) {
        try {
          const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          await handleResponse(response);
          await renderBoards();
        } catch (e) {
          console.error("Ошибка при удалении доски:", e);
          alert("Ошибка при удалении доски!");
        }
      }
    }

    if (favoriteButton) {
      const boardCard = favoriteButton.closest(".board-card");
      const boardId = boardCard.dataset.boardId;
      try {
        const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            favorite: !favoriteButton
              .querySelector("i")
              .classList.contains("favorite-active"),
          }),
        });
        await handleResponse(response);
        await renderBoards();
      } catch (e) {
        console.error("Ошибка при обновлении статуса избранного:", e);
        alert("Ошибка при обновлении статуса избранного!");
      }
    }

    if (actionButton) {
      const moreOptionsMenu = actionButton.nextElementSibling;
      if (moreOptionsMenu) {
        moreOptionsMenu.classList.toggle("active");
      }
    }
  });

  closeModal?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  cancelModal?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (modal && event.target === modal) {
      modal.style.display = "none";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      modal.style.display = "none";
    }
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      boardCategoryInput.value = button.getAttribute("data-value");
    });
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        button.click();
      }
    });
  });

  methodologyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      methodologyButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      boardMethodologyInput.value = button.getAttribute("data-value");
    });
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        button.click();
      }
    });
  });

  newBoardForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("boardTitle")?.value.trim();
    const description = document
      .getElementById("boardDescription")
      ?.value.trim();
    const category = document.getElementById("boardCategory")?.value;
    const methodology = document.getElementById("boardMethodology")?.value;

    if (!title || !description || !category || !methodology) {
      alert("Заполните все обязательные поля!");
      return;
    }
    if (title.length > 100) {
      alert("Название доски не должно превышать 100 символов!");
      return;
    }
    if (description.length > 500) {
      alert("Описание доски не должно превышать 500 символов!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: title,
          description,
          category,
          methodology,
          user_id: USER_ID,
        }),
      });
      await handleResponse(response);
      newBoardForm.reset();
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      categoryButtons[0]?.classList.add("active");
      boardCategoryInput.value = "learning";
      methodologyButtons.forEach((btn) => btn.classList.remove("active"));
      methodologyButtons[0]?.classList.add("active");
      boardMethodologyInput.value = "none";
      modal.style.display = "none";
      await renderBoards();
    } catch (e) {
      console.error("Ошибка при создании доски:", e);
      alert("Ошибка при создании доски!");
    }
  });

  renderBoards();
});
