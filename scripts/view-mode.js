document.addEventListener("DOMContentLoaded", () => {
  const viewButtons = document.querySelectorAll(".view-button");
  const boardsGrid = document.querySelector(".boards-grid");

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Удаляем активный класс у всех кнопок
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      // Добавляем активный класс нажатой кнопке
      button.classList.add("active");

      // Переключаем вид в зависимости от data-view
      const viewType = button.getAttribute("data-view");
      if (viewType === "grid") {
        boardsGrid.style.display = "grid";
        boardsGrid.classList.remove("list-view");
        window.updateBoardVisibility();
      } else if (viewType === "list") {
        boardsGrid.style.display = "flex";
        boardsGrid.classList.add("list-view");
        boardsGrid.style.flexDirection = "column";
        boardsGrid.style.gap = "1rem";
        window.updateBoardVisibility();
      }
    });
  });

  // Инициализация начального вида (сетка по умолчанию)
  viewButtons[0].classList.add("active");
});

// Стили для списка (добавить стили для .new-board-card)
const styles = `
  .boards-grid.list-view .board-card {
    width: 100%;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    height: auto;
  }
  .boards-grid.list-view .new-board-card {
    width: 100%;
    max-width: 100%;
    align-items: center;
    height: auto;
  }
`;

// Создаем style элемент и добавляем стили
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
