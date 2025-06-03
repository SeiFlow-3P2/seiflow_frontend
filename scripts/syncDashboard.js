document.addEventListener("DOMContentLoaded", () => {
  const boardCards = document.querySelectorAll(
    ".board-card:not(.new-board-card)"
  );

  boardCards.forEach((card) => {
    const boardId = card.getAttribute("data-board-id");
    const savedData = localStorage.getItem(`board-${boardId}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      card.querySelector(".board-title").textContent = data.title;
      card.querySelector(".board-description").textContent = data.description;
      card.querySelector(
        ".board-methodology"
      ).textContent = `Методология: ${data.methodology}`;
      card.querySelector(".progress-info span:first-child").textContent =
        data.progress;
      card.querySelector(".progress-fill").style.width = data.progress;
      card.querySelector(
        ".board-last-edited"
      ).textContent = `Последнее редактирование: ${data.lastEdited}`;
      card.setAttribute("data-category", data.category);
    }
  });
});
