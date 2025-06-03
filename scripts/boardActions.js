document.addEventListener("DOMContentLoaded", () => {
  const boardsGrid = document.getElementById("boardsGrid");
  let boards = JSON.parse(localStorage.getItem("boards") || "[]");

  const updateLocalStorage = () => {
    localStorage.setItem("boards", JSON.stringify(boards));
    boards.forEach((board) => {
      localStorage.setItem(`board-${board.boardId}`, JSON.stringify(board));
    });
  };

  boardsGrid?.addEventListener("click", (event) => {
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
      const boardId = parseInt(boardCard.dataset.boardId);
      const board = boards.find((b) => b.boardId === boardId);

      if (board) {
        board.isFavorite = !board.isFavorite;
        updateLocalStorage();

        const starIcon = favoriteButton.querySelector("i");
        starIcon.setAttribute("data-lucide", "star");
        starIcon.classList.toggle("favorite-active", board.isFavorite);
        lucide.createIcons({ container: favoriteButton });
      }
      event.stopPropagation();
    }

    if (deleteButton) {
      const boardCard = deleteButton.closest(".board-card");
      const boardId = parseInt(boardCard.dataset.boardId);
      const boardIndex = boards.findIndex((b) => b.boardId === boardId);

      if (boardIndex !== -1) {
        if (
          confirm(
            `Вы уверены, что хотите удалить доску "${boards[boardIndex].title}"?`
          )
        ) {
          boards.splice(boardIndex, 1);
          boards = boards.map((board, index) => ({
            ...board,
            boardId: index,
          }));
          localStorage.removeItem(`board-${boardId}`);
          localStorage.removeItem(`board-${boardId}-columns`);
          localStorage.removeItem(`board-${boardId}-tasks`);
          localStorage.removeItem(`board-${boardId}-resources`);
          updateLocalStorage();
          window.updateBoardCards();
          const menu = deleteButton.closest(".more-options-menu");
          if (menu) menu.style.display = "none";
        }
      }
      event.stopPropagation();
    }
  });

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
});
