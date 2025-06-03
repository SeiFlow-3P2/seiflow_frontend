lucide.createIcons();

const settingsButton = document.querySelector(".settings-button");
const cancelButton = document.querySelector(".cancel-button");
const saveButton = document.querySelector(".save-button");
const viewMode = document.querySelector(".view-mode");
const editForm = document.querySelector(".edit-form");
const avatarActionButton = document.getElementById("avatarActionButton");
const actionIcon = document.getElementById("actionIcon");
const fileInput = document.getElementById("fileInput");
const avatarImage = document.getElementById("avatarImage");
const avatarIcon = document.getElementById("avatarIcon");

// Элементы для управления модальным окном
const profileLink = document.getElementById("profile");
const profileModal = document.querySelector("#profileModal");
const closeModalButton = document.querySelector(".logout-button");

// Обработчик открытия модального окна
if (profileLink && profileModal) {
  profileLink.addEventListener("click", (e) => {
    e.preventDefault();
    profileModal.classList.remove("hidden");
  });
}

// Обработчик закрытия модального окна
if (closeModalButton && profileModal) {
  closeModalButton.addEventListener("click", () => {
    profileModal.classList.add("hidden");
  });
}

// Закрытие модального окна при клике вне его
if (profileModal && profileLink) {
  document.addEventListener("click", (e) => {
    if (!profileModal.contains(e.target) && !profileLink.contains(e.target)) {
      profileModal.classList.add("hidden");
    }
  });
}

// Обработчик кнопки настроек
settingsButton.addEventListener("click", () => {
  viewMode.style.display = "none";
  editForm.style.display = "block";
});

// Обработчик кнопки отмены
cancelButton.addEventListener("click", () => {
  viewMode.style.display = "block";
  editForm.style.display = "none";
});

// Обработчик кнопки сохранения
saveButton.addEventListener("click", () => {
  viewMode.style.display = "block";
  editForm.style.display = "none";
  console.log("Профиль сохранен");
});

// Функция для обновления вида кнопки
function updateAvatarButton() {
  if (avatarImage.style.display === "none") {
    // Нет фото - показываем иконку добавления
    actionIcon.setAttribute("data-lucide", "plus");
  } else {
    // Есть фото - показываем иконку редактирования
    actionIcon.setAttribute("data-lucide", "edit-2");
  }
  lucide.createIcons(); // Обновляем иконки
}

// Обработчик клика по кнопке
avatarActionButton.addEventListener("click", () => {
  if (avatarImage.style.display === "none") {
    // Нет фото - добавляем новое
    fileInput.click();
  } else {
    // Есть фото - предлагаем удалить
    if (confirm("Удалить текущее фото?")) {
      avatarImage.src = "";
      avatarImage.style.display = "none";
      avatarIcon.style.display = "block";
      fileInput.value = "";
      updateAvatarButton();
    }
  }
});

// Обработчик выбора файла
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      avatarImage.src = e.target.result;
      avatarImage.style.display = "block";
      avatarIcon.style.display = "none";
      updateAvatarButton();
    };
    reader.readAsDataURL(file);
  }
});

// Инициализация при загрузке
updateAvatarButton();
