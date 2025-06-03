
document.addEventListener("DOMContentLoaded", () => {
  config.ui.lucide.initialize();

  const boardCards = document.querySelectorAll(".board-card:not(.new-board-card)");

  boardCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        !e.target.closest(".board-action-button") &&
        !e.target.closest(".more-options-menu")
      ) {
        const boardId = card.getAttribute("data-board-id");
        window.location.href = config.paths.board(boardId);
      }
    });
  });
});

