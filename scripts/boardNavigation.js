document.addEventListener("DOMContentLoaded", () => {
  // Получаем все карточки досок
  const boardCards = document.querySelectorAll(
    ".board-card:not(.new-board-card)"
  );

  boardCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Проверяем, что клик не на кнопке действий
      if (
        !e.target.closest(".board-action-button") &&
        !e.target.closest(".more-options-menu")
      ) {
        const boardId = card.getAttribute("data-board-id");
        const title = card.querySelector(".board-title").textContent;
        const description =
          card.querySelector(".board-description").textContent;
        const category = card.getAttribute("data-category");
        const methodology = card
          .querySelector(".board-methodology")
          .textContent.replace("Методология: ", "");
        const progress = card.querySelector(
          ".progress-info span:first-child"
        ).textContent;
        const lastEdited = card
          .querySelector(".board-last-edited")
          .textContent.replace("Последнее редактирование: ", "");

        // Формируем URL с параметрами
        const params = new URLSearchParams({
          boardId: boardId,
          title: encodeURIComponent(title),
          description: encodeURIComponent(description),
          category: encodeURIComponent(category),
          methodology: encodeURIComponent(methodology),
          progress: encodeURIComponent(progress),
          lastEdited: encodeURIComponent(lastEdited),
        });

        // Переходим на страницу board.html с параметрами
        window.location.href = `board.html?${params.toString()}`;
      }
    });
  });
});
