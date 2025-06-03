document.addEventListener("DOMContentLoaded", () => {
  const boardsGrid = document.getElementById("boardsGrid");
  const createBoardBtn = document.getElementById("create-board-btn");
  const createBoardModal = document.getElementById("create-board-modal");
  const createBoardModalOverlay = document.getElementById(
    "create-board-modal-overlay"
  );
  const modalBoardName = document.getElementById("modal-board-name");
  const modalBoardDescription = document.getElementById(
    "modal-board-description"
  );
  const modalBoardMethodology = document.getElementById(
    "modal-board-methodology"
  );
  const modalBoardCategory = document.getElementById("modal-board-category");
  const saveBoardBtn = document.getElementById("save-create-board-btn");
  const cancelBoardBtn = document.getElementById("cancel-create-board-btn");
  const API_BASE_URL = "http://localhost:8080/v1";
  const USER_ID = "user123";

  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

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

  const updateBoardCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      const boards = data.boards;

      if (boardsGrid) {
        boardsGrid.innerHTML = "";
        boards.forEach((board) => {
          const boardCard = document.createElement("div");
          boardCard.classList.add("board-card");
          boardCard.dataset.boardId = board.id;
          boardCard.dataset.category = board.category;
          boardCard.innerHTML = `
            <div class="board-card-header">
              <h3 class="board-title">${sanitizeInput(board.name)}</h3>
              <button class="board-favorite-button" aria-label="${
                board.favorite
                  ? "Удалить из избранного"
                  : "Добавить в избранное"
              }">
                <i data-lucide="star" class="${
                  board.favorite ? "favorite-active" : ""
                }"></i>
              </button>
              <button class="board-action-button" aria-label="Дополнительные действия">
                <i data-lucide="more-horizontal"></i>
              </button>
              <div class="more-options-menu" style="display: none;">
                <button class="delete-board" data-board-id="${
                  board.id
                }" aria-label="Удалить доску '${sanitizeInput(board.name)}'">
                  Удалить
                </button>
              </div>
            </div>
            <p class="board-description">${sanitizeInput(board.description)}</p>
            <div class="board-info">
              <div class="progress-info">
                <span>${board.progress}%</span>
                <div class="progress-bar">
                  <div class="progress" style="width: ${board.progress}%"></div>
                </div>
              </div>
              <p class="board-methodology">Методология: ${sanitizeInput(
                board.methodology
              )}</p>
              <p class="board-last-edited">Последнее редактирование: ${sanitizeInput(
                new Date(board.updated_at).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              )}</p>
            </div>
          `;
          boardsGrid.appendChild(boardCard);
        });
        lucide.createIcons();
      }
    } catch (e) {
      console.error("Ошибка при загрузке досок:", e);
      alert("Ошибка при загрузке досок!");
    }
  };

  const createBoard = async (name, description, methodology, category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          description,
          methodology,
          category,
          user_id: USER_ID,
        }),
      });
      const data = await handleResponse(response);
      await updateBoardCards();
      return data.board;
    } catch (e) {
      console.error("Ошибка при создании доски:", e);
      alert("Ошибка при создании доски!");
      throw e;
    }
  };

  if (boardsGrid) {
    boardsGrid.addEventListener("click", async (event) => {
      const actionButton = event.target.closest(".board-action-button");
      const favoriteButton = event.target.closest(".board-favorite-button");
      const deleteButton = event.target.closest(".delete-board");

      if (actionButton) {
        const menu = actionButton.nextElementSibling;
        const isVisible = menu.style.display === "block";
        document.querySelectorAll(".more-options-menu").forEach((m) => {
          m.style.display = "none";
        });
        menu.style.display = isVisible ? "none" : "block";
        event.stopPropagation();
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
          await updateBoardCards();
        } catch (e) {
          console.error("Ошибка при обновлении статуса избранного:", e);
          alert("Ошибка при обновлении статуса избранного!");
        }
        event.stopPropagation();
      }

      if (deleteButton) {
        const boardCard = deleteButton.closest(".board-card");
        const boardId = boardCard.dataset.boardId;
        const boardTitle = boardCard.querySelector(".board-title").textContent;
        if (
          confirm(
            `Вы уверены, что хотите удалить доску "${sanitizeInput(
              boardTitle
            )}"?`
          )
        ) {
          try {
            const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
              method: "DELETE",
              headers: getAuthHeaders(),
            });
            await handleResponse(response);
            await updateBoardCards();
            const menu = deleteButton.closest(".more-options-menu");
            if (menu) menu.style.display = "none";
          } catch (e) {
            console.error("Ошибка при удалении доски:", e);
            alert("Ошибка при удалении доски!");
          }
        }
        event.stopPropagation();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".board-action-button") &&
      !event.target.closest(".more-options-menu")
    ) {
      document.querySelectorAll(".more-options-menu").forEach((menu) => {
        menu.style.display = "none";
      });
    }
  });

  if (createBoardBtn) {
    createBoardBtn.addEventListener("click", () => {
      if (createBoardModal && createBoardModalOverlay) {
        createBoardModal.style.display = "flex";
        createBoardModalOverlay.style.display = "block";
        if (modalBoardName) modalBoardName.focus();
      }
    });
  }

  if (saveBoardBtn) {
    saveBoardBtn.addEventListener("click", async () => {
      if (
        modalBoardName &&
        modalBoardDescription &&
        modalBoardMethodology &&
        modalBoardCategory
      ) {
        const name = modalBoardName.value.trim();
        const description = modalBoardDescription.value.trim();
        const methodology = modalBoardMethodology.value.trim();
        const category = modalBoardCategory.value.trim();
        if (name && description && methodology && category) {
          if (name.length > 100) {
            alert("Название доски не должно превышать 100 символов!");
            return;
          }
          if (description.length > 500) {
            alert("Описание доски не должно превышать 500 символов!");
            return;
          }
          try {
            await createBoard(name, description, methodology, category);
            if (createBoardModal && createBoardModalOverlay) {
              createBoardModal.style.display = "none";
              createBoardModalOverlay.style.display = "none";
            }
            modalBoardName.value = "";
            modalBoardDescription.value = "";
            modalBoardMethodology.value = "";
            modalBoardCategory.value = "";
          } catch (e) {
            // Ошибка уже обработана в createBoard
          }
        } else {
          alert("Заполните все обязательные поля!");
        }
      }
    });
  }

  if (cancelBoardBtn && createBoardModal && createBoardModalOverlay) {
    cancelBoardBtn.addEventListener("click", () => {
      createBoardModal.style.display = "none";
      createBoardModalOverlay.style.display = "none";
    });
  }

  if (createBoardModalOverlay) {
    createBoardModalOverlay.addEventListener("click", () => {
      if (createBoardModal) {
        createBoardModal.style.display = "none";
        createBoardModalOverlay.style.display = "none";
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      createBoardModal &&
      createBoardModal.style.display === "flex"
    ) {
      createBoardModal.style.display = "none";
      if (createBoardModalOverlay)
        createBoardModalOverlay.style.display = "none";
    }
  });

  updateBoardCards();
});
