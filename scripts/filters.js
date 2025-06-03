document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = document.querySelectorAll(".filter-category-button"); 
  let boardCards = document.querySelectorAll(
    ".board-card:not(.new-board-card)"
  );
  const boardsGrid = document.getElementById("boardsGrid");
  let activeCategory = "Все доски";

  window.updateBoardVisibility = function () {
    boardCards.forEach((card) => {
      const cardCategory = card.dataset.category || "";
      const matchesCategory =
        activeCategory === "Все доски" || cardCategory === activeCategory;

      if (matchesCategory) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });

    // Перестраиваем карточки без полной очистки DOM
    const visibleCards = Array.from(boardCards).filter(
      (card) => !card.classList.contains("hidden")
    );
    const hiddenCards = Array.from(boardCards).filter((card) =>
      card.classList.contains("hidden")
    );
    const newBoardCard = document.getElementById("newBoardCard");

    // Перемещаем существующие элементы вместо очистки
    let fragment = document.createDocumentFragment();
    visibleCards.forEach((card) => fragment.appendChild(card));
    hiddenCards.forEach((card) => fragment.appendChild(card));
    if (newBoardCard) fragment.appendChild(newBoardCard);

    // Удаляем только существующие дочерние элементы перед добавлением
    while (boardsGrid.firstChild) {
      boardsGrid.removeChild(boardsGrid.firstChild);
    }
    boardsGrid.appendChild(fragment);
  };

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      activeCategory = button.textContent.trim();
      window.updateBoardVisibility();
    });
  });

  const defaultCategoryButton = Array.from(categoryButtons).find(
    (button) => button.textContent.trim() === "Все доски"
  );
  if (defaultCategoryButton) {
    defaultCategoryButton.classList.add("active");
    defaultCategoryButton.setAttribute("aria-pressed", "true");
  }

  boardCards.forEach((card) => {
    const categoryElement = card.querySelector(".board-title");
    if (categoryElement && !card.dataset.category) {
      card.dataset.category = categoryElement.textContent.trim();
    }
  });

  // Обновление списка карточек при добавлении новой
  window.updateBoardCards = function () {
    boardCards = document.querySelectorAll(".board-card:not(.new-board-card)");
    window.updateBoardVisibility();
  };

  window.updateBoardVisibility();
});
