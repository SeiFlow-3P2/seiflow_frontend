
document.addEventListener("DOMContentLoaded", async () => {
  const syncButton = document.getElementById("sync-button");
  const lastSyncTimeElement = document.getElementById("last-sync-time");
  const boardsGrid = document.getElementById("boardsGrid");

  let lastSyncTime = localStorage.getItem(config.storage.lastSyncTime) || null;

  const updateLastSyncTime = () => {
    const now = new Date();
    lastSyncTime = now.toISOString();
    localStorage.setItem(config.storage.lastSyncTime, lastSyncTime);
    if (lastSyncTimeElement) {
      lastSyncTimeElement.textContent = `Последняя синхронизация: ${now.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  };

  const syncBoardsData = async () => {
    if (!boardsGrid) return;

    try {
      const response = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.boards.list}`,
        {
          method: "GET",
          headers: config.utils.getAuthHeaders(),
        }
      );
      const data = await config.utils.handleResponse(response);
      const boards = data.boards;

      boardsGrid.innerHTML = "";
      boards.forEach((board) => {
        const boardCard = document.createElement("div");
        boardCard.classList.add("board-card");
        boardCard.dataset.boardId = board.id;
        boardCard.innerHTML = `
          <div class="board-card-header">
            <h3 class="board-title">${config.utils.sanitizeInput(board.name)}</h3>
            <button class="board-favorite-button" aria-label="${
              board.favorite ? "Удалить из избранного" : "Добавить в избранное"
            }">
              <i data-lucide="star" class="${board.favorite ? "favorite-active" : ""}"></i>
            </button>
            <button class="board-action-button" aria-label="Дополнительные действия">
              <i data-lucide="more-horizontal"></i>
            </button>
            <div class="more-options-menu" style="display: none;">
              <button class="delete-board" data-board-id="${board.id}" aria-label="Удалить доску '${config.utils.sanitizeInput(board.name)}'">
                Удалить
              </button>
            </div>
          </div>
          <p class="board-description">${config.utils.sanitizeInput(board.description)}</p>
          <div class="board-info">
            <div class="progress-info">
              <span>${board.progress}%</span>
              <div class="progress-bar">
                <div class="progress" style="width: ${board.progress}%"></div>
              </div>
            </div>
            <p class="board-methodology">Методология: ${config.utils.sanitizeInput(board.methodology)}</p>
            <p class="board-last-edited">Последнее редактирование: ${config.utils.sanitizeInput(
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

      config.ui.lucide.initialize({ container: boardsGrid });
      updateLastSyncTime();
    } catch (e) {
      console.error("Ошибка синхронизации:", e);
      alert("Ошибка при синхронизации данных!");
    }
  };

  if (lastSyncTime && lastSyncTimeElement) {
    lastSyncTimeElement.textContent = `Последняя синхронизация: ${new Date(lastSyncTime).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (syncButton) {
    syncButton.addEventListener("click", async () => {
      syncButton.disabled = true;
      try {
        await syncBoardsData();
      } finally {
        syncButton.disabled = false;
      }
    });
  }

  // Initial sync
  await syncBoardsData();
});
