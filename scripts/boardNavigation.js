document.addEventListener("DOMContentLoaded", () => {
  const boardCards = document.querySelectorAll(
    ".board-card:not(.new-board-card)"
  );

  boardCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        !e.target.closest(".board-action-button") &&
        !e.target.closest(".more-options-menu")
      ) {
        const boardId = card.getAttribute("data-board-id");
        window.location.href = `board.html?boardId=${boardId}`;
      }
    });
  });
});
