document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM загружен, начинаем инициализацию");

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

  const newBoardButton = document.getElementById("newBoardButton");
  const newBoardCard = document.getElementById("newBoardCard");
  const modal = document.getElementById("newBoardModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const newBoardForm = document.getElementById("newBoardForm");
  const categoryButtons = document.querySelectorAll(".modal-category-button"); // Изменили на .modal-category-button
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

  newBoardButton?.addEventListener("click", () => {
    modal.style.display = "flex";
    
  });

  newBoardCard?.addEventListener("click", () => {
    modal.style.display = "flex";
    
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

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      boardCategoryInput.value = button.getAttribute("data-value");
      
    });
  });

  methodologyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      methodologyButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      boardMethodologyInput.value = button.getAttribute("data-value");
      
    });
  });

  newBoardForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("boardTitle")?.value.trim();
    const description = document
      .getElementById("boardDescription")
      ?.value.trim();
    const category = document.getElementById("boardCategory")?.value;
    const methodology = document.getElementById("boardMethodology")?.value;

    if (!title) {
      alert("Название доски обязательно!");
      return;
    }

    const icon = categoryIcons[category] || "book-open";
    const iconColor = categoryColors[category] || "yellow-icon";
    const categoryText =
      {
        learning: "Обучение",
        health: "Здоровье",
        finance: "Финансы",
        personal: "Личное",
      }[category] || "Обучение";
    const methodologyText =
      { none: "Без методологии", agile: "Аджайл", kanban: "Канбан" }[
        methodology
      ] || "Без методологии";

    const newBoard = document.createElement("div");
    newBoard.classList.add("board-card");
    newBoard.dataset.category = categoryText;
    newBoard.innerHTML = `
      <div class="board-card-content">
        <div class="board-card-header">
          <div class="board-icon-container">
            <i data-lucide="${icon}" class="${iconColor}" aria-hidden="true"></i>
          </div>
          <div class="board-actions">
            <button class="board-action-button" aria-label="Открыть меню действий для доски '${title}'">
              <i data-lucide="more-vertical" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <h3 class="board-title">${title || "Новая доска"}</h3>
        <p class="board-description">${description || "Нет описания"}</p>
        <div class="board-methodology">Методология: ${methodologyText}</div>
        <div class="board-progress">
          <div class="progress-info">
            <span>0%</span>
            <span>100%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%;"></div>
          </div>
        </div>
        <div class="board-last-edited">Последнее редактирование: ${new Date().toLocaleString(
          "ru-RU",
          { day: "numeric", month: "long", year: "numeric" }
        )}</div>
      </div>
    `;

    boardsGrid.insertBefore(newBoard, boardsGrid.firstChild);

    try {
      lucide.createIcons({ container: newBoard });
      console.log("Иконки для новой доски инициализированы");
    } catch (error) {
      console.error("Ошибка при инициализации иконок для новой доски:", error);
    }

    newBoardForm.reset();
    categoryButtons.forEach((btn) => btn.classList.remove("active"));
    categoryButtons[0]?.classList.add("active");
    boardCategoryInput.value = "learning";
    methodologyButtons.forEach((btn) => btn.classList.remove("active"));
    methodologyButtons[0]?.classList.add("active");
    boardMethodologyInput.value = "none";

    modal.style.display = "none";
    window.updateBoardCards();
  });
});
