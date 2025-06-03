document.addEventListener("DOMContentLoaded", async () => {
  const boardsGrid = document.getElementById("boardsGrid");
  const API_BASE_URL = "http://localhost:8080/v1";

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

  async function syncBoards() {
    try {
      const response = await fetch(`${API_BASE_URL}/boards`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      const boards = data.boards || [];

      boardsGrid.innerHTML = `
        <div class="board-card new-board-card" id="new-board-card">
          <div class="new-board-content">
            <i data-lucide="plus" class="icon-plus"></i>
            <span>Создать новую доску</span>
          </div>
        </div>
      `;

      boards.forEach((board) => {
        const card = document.createElement("div");
        card.className = "board-card";
        card.dataset.boardId = board.id;
        card.dataset.category = board.category;
        card.innerHTML = `
          <div class="board-content">
            <div class="board-header">
              <h3 class="board-title">${sanitizeInput(board.name)}</h3>
              <div class="board-actions">
                <button class="board-favorite-button" aria-label="Добавить в избранное">
                  <i data-lucide="star" class="${
                    board.favorite ? "favorite-active" : ""
                  }"></i>
                </button>
                <button class="board-action-button" aria-label="Дополнительные действия">
                  <i data-lucide="more-horizontal"></i>
                </button>
                <div class="more-options-menu" style="display: none;">
                  <button class="delete-board">Удалить</button>
                </div>
              </div>
            </div>
            <p class="board-description">${sanitizeInput(board.description)}</p>
            <p class="board-methodology">Методология: ${sanitizeInput(
              board.methodology
            )}</p>
            <div class="progress-info">
              <span>Прогресс: ${board.progress}%</span>
            </div>
            <p class="board-last-edited">Последнее редактирование: ${new Date(
              board.updated_at
            ).toLocaleDateString("ru-RU")}</p>
          </div>
        `;
        boardsGrid.insertBefore(card, boardsGrid.firstChild);
      });

      lucide.createIcons();
      if (window.updateBoardCards) window.updateBoardCards();
    } catch (error) {
      console.error("Ошибка при загрузке досок:", error.message);
      boardsGrid.innerHTML = "<p>Ошибка загрузки досок. Попробуйте позже.</p>";
    }
  }

  await syncBoards();
});
