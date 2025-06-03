document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // Utility function to sanitize input
  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  // Generate a unique ID (simple incrementing counter stored in localStorage)
  const generateId = (type) => {
    const key = `${type}-id-counter`;
    let counter = parseInt(localStorage.getItem(key) || "0", 10);
    counter += 1;
    localStorage.setItem(key, counter.toString());
    return counter.toString();
  };

  // Extract boardId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get("boardId");

  // Validate boardId
  if (!boardId || boardId === "0") {
    alert(
      "Ошибка: Некорректный ID доски. Пожалуйста, выберите доску из панели управления."
    );
    return;
  }

  // Board metadata
  let title = "Название доски";
  let description = "Описание не указано";
  let category = "Категория не указана";
  let methodology = "Методология не указана";
  let progress = "0%";
  let lastEdited = "Не указано";

  // Safely decode URI components with fallback
  try {
    const titleParam = urlParams.get("title");
    if (titleParam) title = sanitizeInput(decodeURIComponent(titleParam));
  } catch (e) {
    console.warn("Invalid title encoding, using default:", e);
  }
  try {
    const descriptionParam = urlParams.get("description");
    if (descriptionParam)
      description = sanitizeInput(decodeURIComponent(descriptionParam));
  } catch (e) {
    console.warn("Invalid description encoding, using default:", e);
  }
  try {
    const categoryParam = urlParams.get("category");
    if (categoryParam)
      category = sanitizeInput(decodeURIComponent(categoryParam));
  } catch (e) {
    console.warn("Invalid category encoding, using default:", e);
  }
  try {
    const methodologyParam = urlParams.get("methodology");
    if (methodologyParam)
      methodology = sanitizeInput(decodeURIComponent(methodologyParam));
  } catch (e) {
    console.warn("Invalid methodology encoding, using default:", e);
  }
  try {
    const progressParam = urlParams.get("progress");
    if (progressParam)
      progress = sanitizeInput(decodeURIComponent(progressParam));
  } catch (e) {
    console.warn("Invalid progress encoding, using default:", e);
  }
  try {
    const lastEditedParam = urlParams.get("lastEdited");
    if (lastEditedParam)
      lastEdited = sanitizeInput(decodeURIComponent(lastEditedParam));
  } catch (e) {
    console.warn("Invalid lastEdited encoding, using default:", e);
  }

  // DOM Elements
  const boardTitle = document.getElementById("board-title");
  const boardDescription = document.getElementById("board-description");
  const boardCategory = document.getElementById("board-category");
  const boardMethodology = document.getElementById("board-methodology");
  const boardProgress = document.getElementById("board-progress");
  const boardLastEdited = document.getElementById("board-last-edited");
  const editBoardBtn = document.getElementById("edit-board-btn");
  const boardModal = document.getElementById("board-modal");
  const boardModalOverlay = document.getElementById("board-modal-overlay");
  const modalBoardTitle = document.getElementById("modal-board-title");
  const modalBoardDescription = document.getElementById(
    "modal-board-description"
  );
  const saveBoardBtn = document.getElementById("save-board-btn");
  const cancelBoardBtn = document.getElementById("cancel-board-btn");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskModal = document.getElementById("task-modal");
  const taskModalOverlay = document.getElementById("task-modal-overlay");
  const modalTaskText = document.getElementById("modal-task-text");
  const modalTaskDescription = document.getElementById(
    "modal-task-description"
  );
  const modalTaskDeadline = document.getElementById("modal-task-deadline");
  const modalTaskInCalendar = document.getElementById("modal-task-in-calendar");
  const saveTaskBtn = document.querySelector("#task-modal .modal-save-btn");
  const cancelTaskBtn = document.querySelector("#task-modal .modal-cancel-btn");
  const tasksList = document.getElementById("tasks-list");
  const scrumColumns = document.getElementById("scrum-columns");
  const addColumnBtn = document.getElementById("add-column-btn");
  const columnModal = document.getElementById("column-modal");
  const columnModalOverlay = document.getElementById("column-modal-overlay");
  const modalColumnName = document.getElementById("modal-column-name");
  const saveColumnBtn = document.getElementById("save-column-btn");
  const cancelColumnBtn = document.getElementById("cancel-column-btn");
  const addResourceBtn = document.getElementById("add-resource-btn");
  const resourceModal = document.getElementById("resource-modal");
  const resourceModalOverlay = document.getElementById(
    "resource-modal-overlay"
  );
  const modalResourceName = document.getElementById("modal-resource-name");
  const saveResourceBtn = document.getElementById("save-resource-btn");
  const cancelResourceBtn = document.getElementById("cancel-resource-btn");
  const resourcesList = document.getElementById("resources-list");

  // Timer elements for "Tasks" tab
  const timerDisplayTasks = document.getElementById("timer-display-tasks");
  const startButtonTasks = document.getElementById("start-button-tasks");
  const pauseButtonTasks = document.getElementById("pause-button-tasks");
  const resetButtonTasks = document.getElementById("reset-button-tasks");
  const customTimeInputTasks = document.getElementById(
    "custom-time-input-tasks"
  );
  const setTimeButtonTasks = document.getElementById("set-time-button-tasks");
  const timerOptionsTasks = document.querySelectorAll(
    "#tasks .timer-options button"
  );

  // Timer elements for "Resources" tab
  const timerDisplayResources = document.getElementById(
    "timer-display-resources"
  );
  const startButtonResources = document.getElementById(
    "start-button-resources"
  );
  const pauseButtonResources = document.getElementById(
    "pause-button-resources"
  );
  const resetButtonResources = document.getElementById(
    "reset-button-resources"
  );
  const customTimeInputResources = document.getElementById(
    "custom-time-input-resources"
  );
  const setTimeButtonResources = document.getElementById(
    "set-time-button-resources"
  );
  const timerOptionsResources = document.querySelectorAll(
    "#resources .timer-options button"
  );

  // Favorite button for the board
  const favoriteButton = document.querySelector(".board-favorite-button");

  // State management
  let columns = JSON.parse(
    localStorage.getItem(`board-${boardId}-columns`) || "[]"
  );
  let tasks = JSON.parse(
    localStorage.getItem(`board-${boardId}-tasks`) || "[]"
  );
  let resources = JSON.parse(
    localStorage.getItem(`board-${boardId}-resources`) || "[]"
  );
  let boards = JSON.parse(localStorage.getItem("boards") || "[]");
  const board = boards.find((b) => b.boardId === parseInt(boardId));

  // Timer state (shared between tabs)
  let timeLeft = 25 * 60;
  let timerInterval = null;
  let isTimerRunning = false;

  // Initialize columns based on methodology
  if (columns.length === 0) {
    if (methodology.toLowerCase() !== "none") {
      columns = [
        {
          id: generateId("column"),
          name: "To Do",
          board_id: boardId,
          order_number: 1,
        },
        {
          id: generateId("column"),
          name: "In Progress",
          board_id: boardId,
          order_number: 2,
        },
        {
          id: generateId("column"),
          name: "Done",
          board_id: boardId,
          order_number: 3,
        },
      ];
      localStorage.setItem(`board-${boardId}-columns`, JSON.stringify(columns));
    }
  }

  // Initialize board data
  if (boardId) {
    if (boardTitle) boardTitle.textContent = title;
    if (boardDescription) boardDescription.textContent = description;
    if (boardCategory) boardCategory.textContent = `Категория: ${category}`;
    if (boardMethodology)
      boardMethodology.textContent = `Методология: ${methodology}`;
    if (boardProgress) boardProgress.textContent = `Прогресс: ${progress}`;
    if (boardLastEdited)
      boardLastEdited.textContent = `Последнее изменение: ${lastEdited}`;
  }

  // Initialize favorite button state for the board
  if (board && favoriteButton) {
    const starIcon = favoriteButton.querySelector("i");
    if (starIcon) {
      starIcon.setAttribute("data-lucide", "star");
      starIcon.classList.toggle("favorite-active", board.isFavorite);
      lucide.createIcons({ container: favoriteButton });

      favoriteButton.addEventListener("click", () => {
        board.isFavorite = !board.isFavorite;
        localStorage.setItem("boards", JSON.stringify(boards));
        starIcon.classList.toggle("favorite-active", board.isFavorite);
        lucide.createIcons({ container: favoriteButton });
      });
    }
  }

  // Simulated API Endpoints using localStorage
  const simulatePostColumn = (boardId, name) => {
    const newColumn = {
      id: generateId("column"),
      name: sanitizeInput(name),
      board_id: boardId,
      order_number: columns.length + 1,
    };
    columns.push(newColumn);
    localStorage.setItem(`board-${boardId}-columns`, JSON.stringify(columns));
    return newColumn;
  };

  const simulatePatchColumn = (columnId, name) => {
    const columnIndex = columns.findIndex((col) => col.id === columnId);
    if (columnIndex !== -1) {
      if (name) columns[columnIndex].name = sanitizeInput(name);
      localStorage.setItem(`board-${boardId}-columns`, JSON.stringify(columns));
      return columns[columnIndex];
    }
    throw new Error("Column not found");
  };

  const simulateDeleteColumn = (columnId) => {
    columns = columns.filter((col) => col.id !== columnId);
    tasks = tasks.filter((task) => task.column_id !== columnId);
    localStorage.setItem(`board-${boardId}-columns`, JSON.stringify(columns));
    localStorage.setItem(`board-${boardId}-tasks`, JSON.stringify(tasks));
    return {};
  };

  const simulatePostTask = (columnId, taskData) => {
    const newTask = {
      id: generateId("task"),
      name: sanitizeInput(taskData.name),
      description: sanitizeInput(taskData.description || ""),
      deadline: taskData.deadline,
      in_calendar: taskData.in_calendar || false,
      column_id: columnId,
      isCompleted: taskData.isCompleted || false,
    };
    tasks.push(newTask);
    localStorage.setItem(`board-${boardId}-tasks`, JSON.stringify(tasks));
    return newTask;
  };

  const simulatePatchTask = (taskId, taskData) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      if (taskData.name) tasks[taskIndex].name = sanitizeInput(taskData.name);
      if (taskData.description)
        tasks[taskIndex].description = sanitizeInput(taskData.description);
      if (taskData.deadline) tasks[taskIndex].deadline = taskData.deadline;
      if (typeof taskData.in_calendar === "boolean")
        tasks[taskIndex].in_calendar = taskData.in_calendar;
      if (typeof taskData.isCompleted === "boolean")
        tasks[taskIndex].isCompleted = taskData.isCompleted;
      localStorage.setItem(`board-${boardId}-tasks`, JSON.stringify(tasks));
      return tasks[taskIndex];
    }
    throw new Error("Task not found");
  };

  const simulateMoveTask = (taskId, newColumnId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1 && columns.some((col) => col.id === newColumnId)) {
      tasks[taskIndex].column_id = newColumnId;
      localStorage.setItem(`board-${boardId}-tasks`, JSON.stringify(tasks));
      return { task_id: taskId, new_column_id: newColumnId };
    }
    throw new Error("Task or column not found");
  };

  const simulateDeleteTask = (taskId) => {
    tasks = tasks.filter((task) => task.id !== taskId);
    localStorage.setItem(`board-${boardId}-tasks`, JSON.stringify(tasks));
    return {};
  };

  const simulatePostResource = (resourceData) => {
    const newResource = {
      id: generateId("resource"),
      name: sanitizeInput(resourceData.name),
      board_id: boardId,
    };
    resources.push(newResource);
    localStorage.setItem(
      `board-${boardId}-resources`,
      JSON.stringify(resources)
    );
    return newResource;
  };

  const simulateDeleteResource = (resourceId) => {
    resources = resources.filter((resource) => resource.id !== resourceId);
    localStorage.setItem(
      `board-${boardId}-resources`,
      JSON.stringify(resources)
    );
    return {};
  };

  // Save board progress and sync with dashboard
  const saveData = () => {
    const totalTasks = tasks.length;
    let completedTasks = 0;
    if (methodology.toLowerCase() === "none") {
      completedTasks = tasks.filter((task) => task.isCompleted).length;
    } else {
      completedTasks = tasks.filter((task) => {
        const column = columns.find((col) => col.id === task.column_id);
        return column && column.name.toLowerCase() === "done";
      }).length;
    }
    progress =
      totalTasks > 0
        ? `${Math.round((completedTasks / totalTasks) * 100)}%`
        : "0%";
    if (boardProgress) boardProgress.textContent = `Прогресс: ${progress}`;
    syncWithDashboard();
    renderTasks();
    renderScrumColumns();
    renderResources();
  };

  // Render tasks in the "Tasks" tab
  const renderTasks = () => {
    if (tasksList) {
      tasksList.innerHTML = "";
      tasks.forEach((task) => {
        const column = columns.find((col) => col.id === task.column_id);
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        taskItem.innerHTML = `
          <div class="task-content">
            <span class="task-text">${sanitizeInput(task.name)}</span>
            <span class="task-date">${sanitizeInput(task.deadline)}</span>
            <span class="task-column">[${
              column ? sanitizeInput(column.name) : "Без колонки"
            }]</span>
          </div>
          <button class="edit-task-btn" data-task-id="${
            task.id
          }" aria-label="Редактировать задачу '${sanitizeInput(task.name)}'">
            <i data-lucide="edit" class="icon-edit" aria-hidden="true"></i>
          </button>
          <button class="delete-task-btn" data-task-id="${
            task.id
          }" aria-label="Удалить задачу '${sanitizeInput(task.name)}'">
            <i data-lucide="trash-2" class="icon-trash" aria-hidden="true"></i>
          </button>
        `;
        tasksList.appendChild(taskItem);

        const editBtn = taskItem.querySelector(".edit-task-btn");
        if (editBtn) {
          editBtn.addEventListener("click", () => {
            if (
              modalTaskText &&
              modalTaskDescription &&
              modalTaskDeadline &&
              modalTaskInCalendar &&
              taskModal &&
              taskModalOverlay
            ) {
              modalTaskText.value = task.name || "";
              modalTaskDescription.value = task.description || "";
              modalTaskDeadline.value = task.deadline
                ? new Date(task.deadline).toISOString().slice(0, 16)
                : "";
              modalTaskInCalendar.checked = task.in_calendar || false;
              taskModal.style.display = "flex";
              taskModalOverlay.style.display = "block";
              modalTaskText.focus();
              if (saveTaskBtn) {
                saveTaskBtn.onclick = () => {
                  const newName = modalTaskText.value.trim();
                  const newDescription = modalTaskDescription.value.trim();
                  const newDeadline = modalTaskDeadline.value;
                  const newInCalendar = modalTaskInCalendar.checked;
                  if (newName && newDeadline) {
                    simulatePatchTask(task.id, {
                      name: newName,
                      description: newDescription,
                      deadline: newDeadline,
                      in_calendar: newInCalendar,
                    });
                    saveData();
                    taskModal.style.display = "none";
                    taskModalOverlay.style.display = "none";
                  } else if (newName.length > 200) {
                    alert("Название задачи не должно превышать 200 символов!");
                  } else {
                    alert(
                      "Заполните обязательные поля (название и срок выполнения)!"
                    );
                  }
                };
              }
            }
          });
        }

        const deleteBtn = taskItem.querySelector(".delete-task-btn");
        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            if (
              confirm(
                `Вы уверены, что хотите удалить задачу "${sanitizeInput(
                  task.name
                )}"?`
              )
            ) {
              simulateDeleteTask(task.id);
              saveData();
            }
          });
        }
      });
      lucide.createIcons();
    }
  };

  // Render Scrum columns and tasks in the "Overview" tab
  const renderScrumColumns = () => {
    if (scrumColumns) {
      scrumColumns.innerHTML = "";
      if (columns.length === 0) {
        scrumColumns.innerHTML = `
          <div class="empty-columns-message">
            <p>Колонок пока нет. Добавьте новую колонку, чтобы начать!</p>
          </div>
        `;
      } else {
        columns.forEach((column) => {
          const columnDiv = document.createElement("div");
          columnDiv.classList.add("scrum-column");
          columnDiv.dataset.columnId = column.id;
          columnDiv.innerHTML = `
            <div class="scrum-column-header">
              <h3>${sanitizeInput(column.name)}</h3>
              <div class="scrum-column-actions">
                <button class="edit-column-btn" data-column-id="${
                  column.id
                }" aria-label="Редактировать колонку '${sanitizeInput(
            column.name
          )}'">
                  <i data-lucide="edit" class="icon-edit" aria-hidden="true"></i>
                </button>
                <button class="delete-column-btn" data-column-id="${
                  column.id
                }" aria-label="Удалить колонку '${sanitizeInput(column.name)}'">
                  <i data-lucide="trash-2" class="icon-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="tasks-list" data-column-id="${
              column.id
            }" id="tasks-list-${column.id}"></div>
            <button class="add-task" data-column-id="${column.id}">
              <i data-lucide="plus" class="icon-plus"></i>
              <span>Добавить задачу</span>
            </button>
          `;
          scrumColumns.appendChild(columnDiv);

          const tasksList = columnDiv.querySelector(`#tasks-list-${column.id}`);
          tasks
            .filter((task) => task.column_id === column.id)
            .forEach((task) => {
              const taskItem = document.createElement("div");
              taskItem.classList.add("task-item");
              taskItem.draggable = true;
              taskItem.dataset.taskId = task.id;
              let taskContent = `
              <div class="task-content">
                <span class="task-text">${sanitizeInput(task.name)}</span>
                <span class="task-date">${sanitizeInput(task.deadline)}</span>
              </div>
              <button class="edit-task-btn" data-task-id="${
                task.id
              }" aria-label="Редактировать задачу '${sanitizeInput(
                task.name
              )}'">
                <i data-lucide="edit" class="icon-edit" aria-hidden="true"></i>
              </button>
              <button class="delete-task-btn" data-task-id="${
                task.id
              }" aria-label="Удалить задачу '${sanitizeInput(task.name)}'">
                <i data-lucide="trash-2" class="icon-trash" aria-hidden="true"></i>
              </button>
              <select class="status-select" data-task-id="${task.id}">
                ${columns
                  .map(
                    (col) =>
                      `<option value="${col.id}" ${
                        task.column_id === col.id ? "selected" : ""
                      }>${sanitizeInput(col.name)}</option>`
                  )
                  .join("")}
              </select>
            `;
              if (methodology.toLowerCase() === "none") {
                taskContent = `
                <div class="task-content">
                  <input type="checkbox" class="task-checkbox" data-task-id="${
                    task.id
                  }" ${task.isCompleted ? "checked" : ""}>
                  <span class="task-text">${sanitizeInput(task.name)}</span>
                  <span class="task-date">${sanitizeInput(task.deadline)}</span>
                </div>
                <button class="edit-task-btn" data-task-id="${
                  task.id
                }" aria-label="Редактировать задачу '${sanitizeInput(
                  task.name
                )}'">
                  <i data-lucide="edit" class="icon-edit" aria-hidden="true"></i>
                </button>
                <button class="delete-task-btn" data-task-id="${
                  task.id
                }" aria-label="Удалить задачу '${sanitizeInput(task.name)}'">
                  <i data-lucide="trash-2" class="icon-trash" aria-hidden="true"></i>
                </button>
              `;
              }
              taskItem.innerHTML = taskContent;
              tasksList.appendChild(taskItem);

              taskItem.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", task.id);
              });

              const editBtn = taskItem.querySelector(".edit-task-btn");
              if (editBtn) {
                editBtn.addEventListener("click", () => {
                  if (
                    modalTaskText &&
                    modalTaskDescription &&
                    modalTaskDeadline &&
                    modalTaskInCalendar &&
                    taskModal &&
                    taskModalOverlay
                  ) {
                    modalTaskText.value = task.name || "";
                    modalTaskDescription.value = task.description || "";
                    modalTaskDeadline.value = task.deadline
                      ? new Date(task.deadline).toISOString().slice(0, 16)
                      : "";
                    modalTaskInCalendar.checked = task.in_calendar || false;
                    taskModal.style.display = "flex";
                    taskModalOverlay.style.display = "block";
                    modalTaskText.focus();
                    if (saveTaskBtn) {
                      saveTaskBtn.onclick = () => {
                        const newName = modalTaskText.value.trim();
                        const newDescription =
                          modalTaskDescription.value.trim();
                        const newDeadline = modalTaskDeadline.value;
                        const newInCalendar = modalTaskInCalendar.checked;
                        if (newName && newDeadline) {
                          simulatePatchTask(task.id, {
                            name: newName,
                            description: newDescription,
                            deadline: newDeadline,
                            in_calendar: newInCalendar,
                          });
                          saveData();
                          taskModal.style.display = "none";
                          taskModalOverlay.style.display = "none";
                        } else if (newName.length > 200) {
                          alert(
                            "Название задачи не должно превышать 200 символов!"
                          );
                        } else {
                          alert(
                            "Заполните обязательные поля (название и срок выполнения)!"
                          );
                        }
                      };
                    }
                  }
                });
              }

              const deleteBtn = taskItem.querySelector(".delete-task-btn");
              if (deleteBtn) {
                deleteBtn.addEventListener("click", () => {
                  if (
                    confirm(
                      `Вы уверены, что хотите удалить задачу "${sanitizeInput(
                        task.name
                      )}"?`
                    )
                  ) {
                    simulateDeleteTask(task.id);
                    saveData();
                  }
                });
              }

              if (methodology.toLowerCase() === "none") {
                const checkbox = taskItem.querySelector(".task-checkbox");
                if (checkbox) {
                  checkbox.addEventListener("change", () => {
                    simulatePatchTask(task.id, {
                      isCompleted: checkbox.checked,
                    });
                    saveData();
                  });
                }
              } else {
                const statusSelect = taskItem.querySelector(".status-select");
                if (statusSelect) {
                  statusSelect.addEventListener("change", () => {
                    simulateMoveTask(task.id, statusSelect.value);
                    saveData();
                  });
                }
              }
            });

          columnDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
          });

          columnDiv.addEventListener("drop", (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("text/plain");
            simulateMoveTask(taskId, column.id);
            saveData();
          });

          const addTaskButton = columnDiv.querySelector(".add-task");
          if (addTaskButton) {
            addTaskButton.addEventListener("click", () => {
              if (
                modalTaskText &&
                modalTaskDescription &&
                modalTaskDeadline &&
                modalTaskInCalendar &&
                taskModal &&
                taskModalOverlay
              ) {
                modalTaskText.value = "";
                modalTaskDescription.value = "";
                modalTaskDeadline.value = "";
                modalTaskInCalendar.checked = false;
                taskModal.style.display = "flex";
                taskModalOverlay.style.display = "block";
                modalTaskText.focus();
                if (saveTaskBtn) {
                  saveTaskBtn.onclick = () => {
                    const taskText = modalTaskText.value.trim();
                    const taskDescription = modalTaskDescription.value.trim();
                    const taskDeadline = modalTaskDeadline.value;
                    const taskInCalendar = modalTaskInCalendar.checked;
                    if (taskText && taskDeadline) {
                      simulatePostTask(column.id, {
                        name: taskText,
                        description: taskDescription,
                        deadline: taskDeadline,
                        in_calendar: taskInCalendar,
                      });
                      saveData();
                      taskModal.style.display = "none";
                      taskModalOverlay.style.display = "none";
                    } else if (taskText.length > 200) {
                      alert(
                        "Название задачи не должно превышать 200 символов!"
                      );
                    } else {
                      alert(
                        "Заполните обязательные поля (название и срок выполнения)!"
                      );
                    }
                  };
                }
              }
            });
          }

          const editColumnBtn = columnDiv.querySelector(".edit-column-btn");
          if (editColumnBtn) {
            editColumnBtn.addEventListener("click", () => {
              if (modalColumnName && columnModal && columnModalOverlay) {
                modalColumnName.value = column.name;
                columnModal.style.display = "flex";
                columnModalOverlay.style.display = "block";
                modalColumnName.focus();
                if (saveColumnBtn) {
                  saveColumnBtn.onclick = () => {
                    const newName = modalColumnName.value.trim();
                    if (newName) {
                      simulatePatchColumn(column.id, newName);
                      saveData();
                      columnModal.style.display = "none";
                      columnModalOverlay.style.display = "none";
                    } else {
                      alert("Название колонки не может быть пустым!");
                    }
                  };
                }
              }
            });
          }

          const deleteColumnBtn = columnDiv.querySelector(".delete-column-btn");
          if (deleteColumnBtn) {
            deleteColumnBtn.addEventListener("click", () => {
              if (
                confirm(
                  `Вы уверены, что хотите удалить колонку "${sanitizeInput(
                    column.name
                  )}"? Все задачи в этой колонке будут удалены.`
                )
              ) {
                simulateDeleteColumn(column.id);
                saveData();
              }
            });
          }
        });
      }
      lucide.createIcons();
    }
  };

  // Render resources in the "Resources" tab
  const renderResources = () => {
    if (resourcesList) {
      resourcesList.innerHTML = "";
      if (resources.length === 0) {
        resourcesList.innerHTML = "<p>Ресурсов пока нет. Добавьте новый!</p>";
      } else {
        resources.forEach((resource) => {
          const resourceItem = document.createElement("div");
          resourceItem.classList.add("resource-item");
          resourceItem.innerHTML = `
            <div class="resource-content">
              <i data-lucide="file" class="resource-icon"></i>
              <span class="resource-name">${sanitizeInput(resource.name)}</span>
            </div>
            <button class="delete-resource-btn" data-resource-id="${
              resource.id
            }" aria-label="Удалить ресурс '${sanitizeInput(resource.name)}'">
              <i data-lucide="trash-2" class="icon-trash" aria-hidden="true"></i>
            </button>
          `;
          resourcesList.appendChild(resourceItem);

          const deleteBtn = resourceItem.querySelector(".delete-resource-btn");
          if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
              if (
                confirm(
                  `Вы уверены, что хотите удалить ресурс "${sanitizeInput(
                    resource.name
                  )}"?`
                )
              ) {
                simulateDeleteResource(resource.id);
                saveData();
              }
            });
          }
        });
      }
      lucide.createIcons();
    }
  };

  // Tabs handling
  const tabs = document.querySelectorAll(".tab");
  const tabPanes = document.querySelectorAll(".tab-pane");

  if (tabs.length > 0) {
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tabPanes.forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        document
          .querySelector(`.tab-pane[data-tab="${tab.dataset.tab}"]`)
          .classList.add("active");

        if (tab.dataset.tab === "overview") {
          renderScrumColumns();
        } else if (tab.dataset.tab === "tasks") {
          renderTasks();
        } else if (tab.dataset.tab === "resources") {
          renderResources();
        }
      });

      tab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          tab.click();
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const nextTab = tabs[index + 1] || tabs[0];
          nextTab.focus();
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prevTab = tabs[index - 1] || tabs[tabs.length - 1];
          prevTab.focus();
        }
      });
    });
  }

  // Board editing
  if (editBoardBtn) {
    editBoardBtn.addEventListener("click", () => {
      if (
        modalBoardTitle &&
        modalBoardDescription &&
        boardModal &&
        boardModalOverlay
      ) {
        modalBoardTitle.value = title;
        modalBoardDescription.value = description;
        boardModal.style.display = "flex";
        boardModalOverlay.style.display = "block";
        modalBoardTitle.focus();
      }
    });
  }

  const syncWithDashboard = () => {
    const boardData = {
      boardId,
      title,
      description,
      category,
      methodology,
      progress,
      lastEdited,
    };
    localStorage.setItem(`board-${boardId}`, JSON.stringify(boardData));
  };

  if (saveBoardBtn) {
    saveBoardBtn.addEventListener("click", () => {
      if (modalBoardTitle && modalBoardDescription) {
        const newTitle = modalBoardTitle.value.trim() || title;
        const newDescription =
          modalBoardDescription.value.trim() || description;
        if (newTitle.length > 100) {
          alert("Название доски не должно превышать 100 символов!");
          return;
        }
        if (newDescription.length > 500) {
          alert("Описание доски не должно превышать 500 символов!");
          return;
        }

        const currentDate = new Date().toLocaleString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        title = sanitizeInput(newTitle);
        description = sanitizeInput(newDescription);
        lastEdited = currentDate;

        if (boardTitle) boardTitle.textContent = title;
        if (boardDescription) boardDescription.textContent = description;
        if (boardLastEdited)
          boardLastEdited.textContent = `Последнее изменение: ${lastEdited}`;

        const params = new URLSearchParams({
          boardId,
          title: encodeURIComponent(title),
          description: encodeURIComponent(description),
          category: encodeURIComponent(category),
          methodology: encodeURIComponent(methodology),
          progress: encodeURIComponent(progress),
          lastEdited: encodeURIComponent(lastEdited),
        });
        window.history.replaceState({}, "", `?${params.toString()}`);

        syncWithDashboard();

        if (boardModal && boardModalOverlay) {
          boardModal.style.display = "none";
          boardModalOverlay.style.display = "none";
        }
      }
    });
  }

  if (cancelBoardBtn && boardModal && boardModalOverlay) {
    cancelBoardBtn.addEventListener("click", () => {
      boardModal.style.display = "none";
      boardModalOverlay.style.display = "none";
    });
  }

  if (boardModalOverlay) {
    boardModalOverlay.addEventListener("click", () => {
      if (boardModal) {
        boardModal.style.display = "none";
        boardModalOverlay.style.display = "none";
      }
    });
  }

  // Add task from "Tasks" tab
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      if (columns.length === 0) {
        alert("Сначала добавьте хотя бы одну колонку на вкладке 'Обзор'!");
        return;
      }
      if (
        modalTaskText &&
        modalTaskDescription &&
        modalTaskDeadline &&
        modalTaskInCalendar &&
        taskModal &&
        taskModalOverlay
      ) {
        modalTaskText.value = "";
        modalTaskDescription.value = "";
        modalTaskDeadline.value = "";
        modalTaskInCalendar.checked = false;
        taskModal.style.display = "flex";
        taskModalOverlay.style.display = "block";
        modalTaskText.focus();
        if (saveTaskBtn) {
          saveTaskBtn.onclick = () => {
            const taskText = modalTaskText.value.trim();
            const taskDescription = modalTaskDescription.value.trim();
            const taskDeadline = modalTaskDeadline.value;
            const taskInCalendar = modalTaskInCalendar.checked;
            if (taskText && taskDeadline) {
              const defaultColumn =
                columns.find((col) => col.name.toLowerCase() === "to do") ||
                columns[0];
              if (defaultColumn) {
                simulatePostTask(defaultColumn.id, {
                  name: taskText,
                  description: taskDescription,
                  deadline: taskDeadline,
                  in_calendar: taskInCalendar,
                });
                saveData();
                taskModal.style.display = "none";
                taskModalOverlay.style.display = "none";
              } else {
                alert(
                  "Не удалось найти колонку по умолчанию для новой задачи!"
                );
              }
            } else if (taskText.length > 200) {
              alert("Название задачи не должно превышать 200 символов!");
            } else {
              alert(
                "Заполните обязательные поля (название и срок выполнения)!"
              );
            }
          };
        }
      }
    });
  }

  if (cancelTaskBtn && taskModal && taskModalOverlay) {
    cancelTaskBtn.addEventListener("click", () => {
      taskModal.style.display = "none";
      taskModalOverlay.style.display = "none";
    });
  }

  if (taskModalOverlay) {
    taskModalOverlay.addEventListener("click", () => {
      if (taskModal) {
        taskModal.style.display = "none";
        taskModalOverlay.style.display = "none";
      }
    });
  }

  // Add column
  if (addColumnBtn) {
    addColumnBtn.addEventListener("click", () => {
      if (modalColumnName && columnModal && columnModalOverlay) {
        modalColumnName.value = "";
        columnModal.style.display = "flex";
        columnModalOverlay.style.display = "block";
        modalColumnName.focus();
        if (saveColumnBtn) {
          saveColumnBtn.onclick = () => {
            const columnName = modalColumnName.value.trim();
            if (columnName) {
              simulatePostColumn(boardId, columnName);
              saveData();
              columnModal.style.display = "none";
              columnModalOverlay.style.display = "none";
            } else {
              alert("Название колонки не может быть пустым!");
            }
          };
        }
      }
    });
  }

  if (cancelColumnBtn && columnModal && columnModalOverlay) {
    cancelColumnBtn.addEventListener("click", () => {
      columnModal.style.display = "none";
      columnModalOverlay.style.display = "none";
    });
  }

  if (columnModalOverlay) {
    columnModalOverlay.addEventListener("click", () => {
      if (columnModal) {
        columnModal.style.display = "none";
        columnModalOverlay.style.display = "none";
      }
    });
  }

  // Add resource
  if (addResourceBtn) {
    addResourceBtn.addEventListener("click", () => {
      if (modalResourceName && resourceModal && resourceModalOverlay) {
        modalResourceName.value = "";
        resourceModal.style.display = "flex";
        resourceModalOverlay.style.display = "block";
        modalResourceName.focus();
        if (saveResourceBtn) {
          saveResourceBtn.onclick = () => {
            const resourceName = modalResourceName.value.trim();
            if (resourceName) {
              simulatePostResource({ name: resourceName });
              saveData();
              resourceModal.style.display = "none";
              resourceModalOverlay.style.display = "none";
            } else {
              alert("Название файла не может быть пустым!");
            }
          };
        }
      }
    });
  }

  if (cancelResourceBtn && resourceModal && resourceModalOverlay) {
    cancelResourceBtn.addEventListener("click", () => {
      resourceModal.style.display = "none";
      resourceModalOverlay.style.display = "none";
    });
  }

  if (resourceModalOverlay) {
    resourceModalOverlay.addEventListener("click", () => {
      if (resourceModal) {
        resourceModal.style.display = "none";
        resourceModalOverlay.style.display = "none";
      }
    });
  }

  // Timer functionality (shared for "Tasks" and "Resources" tabs)
  const updateDisplay = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    if (timerDisplayTasks) timerDisplayTasks.textContent = timeString;
    if (timerDisplayResources) timerDisplayResources.textContent = timeString;
  };

  const startTimer = () => {
    if (!isTimerRunning && timeLeft > 0) {
      isTimerRunning = true;
      if (startButtonTasks) startButtonTasks.textContent = "Старт";
      if (startButtonResources) startButtonResources.textContent = "Старт";
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateDisplay();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          isTimerRunning = false;
          if (startButtonTasks) startButtonTasks.textContent = "Старт";
          if (startButtonResources) startButtonResources.textContent = "Старт";
          alert("Таймер завершён!");
        }
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      isTimerRunning = false;
      if (startButtonTasks) startButtonTasks.textContent = "Возобновить";
      if (startButtonResources)
        startButtonResources.textContent = "Возобновить";
    }
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    if (startButtonTasks) startButtonTasks.textContent = "Старт";
    if (startButtonResources) startButtonResources.textContent = "Старт";
    timeLeft =
      (customTimeInputTasks && customTimeInputTasks.value) ||
      (customTimeInputResources && customTimeInputResources.value)
        ? parseInt(
            customTimeInputTasks?.value || customTimeInputResources?.value
          ) * 60
        : 25 * 60;
    updateDisplay();
  };

  if (startButtonTasks) {
    startButtonTasks.addEventListener("click", startTimer);
  }
  if (pauseButtonTasks) {
    pauseButtonTasks.addEventListener("click", pauseTimer);
  }
  if (resetButtonTasks) {
    resetButtonTasks.addEventListener("click", resetTimer);
  }
  if (setTimeButtonTasks && customTimeInputTasks) {
    setTimeButtonTasks.addEventListener("click", () => {
      const customTime = parseInt(customTimeInputTasks.value);
      if (customTime && customTime > 0) {
        timeLeft = customTime * 60;
        resetTimer();
      } else {
        alert("Введите корректное время (положительное число минут)!");
      }
    });
  }
  if (timerOptionsTasks.length > 0) {
    timerOptionsTasks.forEach((button) => {
      button.addEventListener("click", () => {
        const time = parseInt(button.dataset.time);
        if (time > 0) {
          timeLeft = time * 60;
          resetTimer();
        }
      });
    });
  }

  // Timer controls for "Resources" tab
  if (startButtonResources) {
    startButtonResources.addEventListener("click", startTimer);
  }
  if (pauseButtonResources) {
    pauseButtonResources.addEventListener("click", pauseTimer);
  }
  if (resetButtonResources) {
    resetButtonResources.addEventListener("click", resetTimer);
  }
  if (setTimeButtonResources && customTimeInputResources) {
    setTimeButtonResources.addEventListener("click", () => {
      const customTime = parseInt(customTimeInputResources.value);
      if (customTime && customTime > 0) {
        timeLeft = customTime * 60;
        resetTimer();
      } else {
        alert("Введите корректное время (положительное число минут)!");
      }
    });
  }
  if (timerOptionsResources.length > 0) {
    timerOptionsResources.forEach((button) => {
      button.addEventListener("click", () => {
        const time = parseInt(button.dataset.time);
        if (time > 0) {
          timeLeft = time * 60;
          resetTimer();
        }
      });
    });
  }

  // Global keyboard handlers
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (boardModal && boardModal.style.display === "flex") {
        boardModal.style.display = "none";
        if (boardModalOverlay) boardModalOverlay.style.display = "none";
      }
      if (taskModal && taskModal.style.display === "flex") {
        taskModal.style.display = "none";
        if (taskModalOverlay) taskModalOverlay.style.display = "none";
      }
      if (columnModal && columnModal.style.display === "flex") {
        columnModal.style.display = "none";
        if (columnModalOverlay) columnModalOverlay.style.display = "none";
      }
      if (resourceModal && resourceModal.style.display === "flex") {
        resourceModal.style.display = "none";
        if (resourceModalOverlay) resourceModalOverlay.style.display = "none";
      }
    }
  });

  // Initial render
  renderScrumColumns();
  renderTasks();
  renderResources();
  updateDisplay();
});
