document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // Utility function to sanitize input
  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  // Generate ID for mock resources
  const generateId = (prefix) => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Base API URL
  const API_BASE_URL = "http://localhost:8080/v1";

  // Simulated user_id (replace with actual authentication mechanism)
  const USER_ID = "user123"; // TODO: Replace with actual user ID from auth

  // Authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || "mock-token";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Handle HTTP response
  const handleResponse = async (response) => {
    if (response.status === 401) {
      alert("Необходима авторизация!");
      window.location.href = "/login.html";
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error ${response.status}: ${error}`);
    }
    if (response.status === 204) return {};
    return response.json();
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
  let columns = [];
  let tasks = [];
  let resources = [];
  let favorite = false;

  // Initialize board data from API
  const initializeBoardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      const board = data.board;
      title = sanitizeInput(board.name);
      description = sanitizeInput(board.description);
      category = sanitizeInput(board.category);
      methodology = sanitizeInput(board.methodology);
      progress = `${board.progress}%`;
      lastEdited = new Date(board.updated_at).toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      favorite = board.favorite || false;
      columns = board.columns || [];
      tasks = board.columns.flatMap((col) => col.tasks || []) || [];
      resources = JSON.parse(
        localStorage.getItem(`board-${boardId}-resources`) || "[]"
      );

      // Update DOM
      if (boardTitle) boardTitle.textContent = title;
      if (boardDescription) boardDescription.textContent = description;
      if (boardCategory) boardCategory.textContent = `Категория: ${category}`;
      if (boardMethodology)
        boardMethodology.textContent = `Методология: ${methodology}`;
      if (boardProgress) boardProgress.textContent = `Прогресс: ${progress}`;
      if (boardLastEdited)
        boardLastEdited.textContent = `Последнее изменение: ${lastEdited}`;
    } catch (e) {
      console.warn("Error fetching board data, using defaults:", e);
      alert("Ошибка при загрузке данных доски!");
    }
  };

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

  // Timer elements
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

  // Favorite button
  const favoriteButton = document.querySelector(".board-favorite-button");

  // Timer state
  let timeLeft = 25 * 60;
  let timerInterval = null;
  let isTimerRunning = false;

  // API Endpoints
  const postColumn = async (boardId, name) => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return await handleResponse(response);
  };

  const patchColumn = async (columnId, name) => {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return await handleResponse(response);
  };

  const deleteColumn = async (columnId) => {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  };

  const postTask = async (columnId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: taskData.name,
        description: taskData.description || "",
        deadline: taskData.deadline,
        in_calendar: taskData.in_calendar || false,
      }),
    });
    return await handleResponse(response);
  };

  const patchTask = async (taskId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: taskData.name,
        description: taskData.description,
        deadline: taskData.deadline,
        in_calendar: taskData.in_calendar,
        isCompleted: taskData.isCompleted,
      }),
    });
    return await handleResponse(response);
  };

  const moveTask = async (taskId, newColumnId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/move/${newColumnId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ task_id: taskId }),
    });
    return await handleResponse(response);
  };

  const deleteTask = async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  };

  const postResource = (resourceData) => {
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

  const deleteResource = (resourceId) => {
    resources = resources.filter((resource) => resource.id !== resourceId);
    localStorage.setItem(
      `board-${boardId}-resources`,
      JSON.stringify(resources)
    );
    return {};
  };

  // Save board progress and sync with dashboard
  const saveData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      const board = data.board;
      tasks = board.columns.flatMap((col) => col.tasks || []) || [];
      columns = board.columns || [];
      progress = `${board.progress}%`;
      if (boardProgress) boardProgress.textContent = `Прогресс: ${progress}`;
      renderTasks();
      renderScrumColumns();
      renderResources();
    } catch (e) {
      console.error("Error saving data:", e);
      alert("Ошибка при синхронизации данных!");
    }
  };

  // Render tasks in the "Tasks" tab
  const renderTasks = () => {
    if (tasksList) {
      tasksList.innerHTML = "";
      tasks.forEach((task) => {
        const column = columns.find((col) => col.id === task.column_id);
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        const formattedDeadline = task.deadline
          ? new Date(task.deadline).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "";
        taskItem.innerHTML = `
          <div class="task-content">
            <span class="task-text">${sanitizeInput(task.name)}</span>
            <span class="task-date">${sanitizeInput(formattedDeadline)}</span>
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
                saveTaskBtn.onclick = async () => {
                  const newName = modalTaskText.value.trim();
                  const newDescription = modalTaskDescription.value.trim();
                  const newDeadline = modalTaskDeadline.value;
                  const newInCalendar = modalTaskInCalendar.checked;
                  if (newName && newDeadline) {
                    await patchTask(task.id, {
                      name: newName,
                      description: newDescription,
                      deadline: newDeadline,
                      in_calendar: newInCalendar,
                    });
                    await saveData();
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
          deleteBtn.addEventListener("click", async () => {
            if (
              confirm(
                `Вы уверены, что хотите удалить задачу "${sanitizeInput(
                  task.name
                )}"?`
              )
            ) {
              await deleteTask(task.id);
              await saveData();
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
              const formattedDeadline = task.deadline
                ? new Date(task.deadline).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "";
              let taskContent = `
              <div class="task-content">
                <span class="task-text">${sanitizeInput(task.name)}</span>
                <span class="task-date">${sanitizeInput(
                  formattedDeadline
                )}</span>
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
                  <span class="task-date">${sanitizeInput(
                    formattedDeadline
                  )}</span>
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
                      saveTaskBtn.onclick = async () => {
                        const newName = modalTaskText.value.trim();
                        const newDescription =
                          modalTaskDescription.value.trim();
                        const newDeadline = modalTaskDeadline.value;
                        const newInCalendar = modalTaskInCalendar.checked;
                        if (newName && newDeadline) {
                          await patchTask(task.id, {
                            name: newName,
                            description: newDescription,
                            deadline: newDeadline,
                            in_calendar: newInCalendar,
                          });
                          await saveData();
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
                deleteBtn.addEventListener("click", async () => {
                  if (
                    confirm(
                      `Вы уверены, что хотите удалить задачу "${sanitizeInput(
                        task.name
                      )}"?`
                    )
                  ) {
                    await deleteTask(task.id);
                    await saveData();
                  }
                });
              }

              if (methodology.toLowerCase() === "none") {
                const checkbox = taskItem.querySelector(".task-checkbox");
                if (checkbox) {
                  checkbox.addEventListener("change", async () => {
                    await patchTask(task.id, {
                      isCompleted: checkbox.checked,
                    });
                    await saveData();
                  });
                }
              } else {
                const statusSelect = taskItem.querySelector(".status-select");
                if (statusSelect) {
                  statusSelect.addEventListener("change", async () => {
                    await moveTask(task.id, statusSelect.value);
                    await saveData();
                  });
                }
              }
            });

          columnDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
          });

          columnDiv.addEventListener("drop", async (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("text/plain");
            await moveTask(taskId, column.id);
            await saveData();
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
                  saveTaskBtn.onclick = async () => {
                    const taskText = modalTaskText.value.trim();
                    const taskDescription = modalTaskDescription.value.trim();
                    const taskDeadline = modalTaskDeadline.value;
                    const taskInCalendar = modalTaskInCalendar.checked;
                    if (taskText && taskDeadline) {
                      await postTask(column.id, {
                        name: taskText,
                        description: taskDescription,
                        deadline: taskDeadline,
                        in_calendar: taskInCalendar,
                      });
                      await saveData();
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
                  saveColumnBtn.onclick = async () => {
                    const newName = modalColumnName.value.trim();
                    if (newName) {
                      await patchColumn(column.id, newName);
                      await saveData();
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
            deleteColumnBtn.addEventListener("click", async () => {
              if (
                confirm(
                  `Вы уверены, что хотите удалить колонку "${sanitizeInput(
                    column.name
                  )}"? Все задачи в этой колонке будут удалены.`
                )
              ) {
                await deleteColumn(column.id);
                await saveData();
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
                deleteResource(resource.id);
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

  if (saveBoardBtn) {
    saveBoardBtn.addEventListener("click", async () => {
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

        try {
          const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              name: newTitle,
              description: newDescription,
            }),
          });
          const data = await handleResponse(response);
          const board = data.board;
          title = sanitizeInput(board.name);
          description = sanitizeInput(board.description);
          lastEdited = new Date(board.updated_at).toLocaleString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          if (boardTitle) boardTitle.textContent = title;
          if (boardDescription) boardDescription.textContent = description;
          if (boardLastEdited)
            boardLastEdited.textContent = `Последнее изменение: ${lastEdited}`;

          if (boardModal && boardModalOverlay) {
            boardModal.style.display = "none";
            boardModalOverlay.style.display = "none";
          }
        } catch (e) {
          console.error("Error updating board:", e);
          alert("Ошибка при обновлении доски!");
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
          saveTaskBtn.onclick = async () => {
            const taskText = modalTaskText.value.trim();
            const taskDescription = modalTaskDescription.value.trim();
            const taskDeadline = modalTaskDeadline.value;
            const taskInCalendar = modalTaskInCalendar.checked;
            if (taskText && taskDeadline) {
              const defaultColumn =
                columns.find((col) => col.name.toLowerCase() === "to do") ||
                columns[0];
              if (defaultColumn) {
                await postTask(defaultColumn.id, {
                  name: taskText,
                  description: taskDescription,
                  deadline: taskDeadline,
                  in_calendar: taskInCalendar,
                });
                await saveData();
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
          saveColumnBtn.onclick = async () => {
            const columnName = modalColumnName.value.trim();
            if (columnName) {
              await postColumn(boardId, columnName);
              await saveData();
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
              postResource({ name: resourceName });
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

  // Timer functionality
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

  // Initialize favorite button state for the board
  if (favoriteButton) {
    favoriteButton.addEventListener("click", async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ favorite: !favorite }),
        });
        const data = await handleResponse(response);
        favorite = data.board.favorite;
        const starIcon = favoriteButton.querySelector("i");
        if (starIcon) {
          starIcon.setAttribute("data-lucide", "star");
          starIcon.classList.toggle("favorite-active", favorite);
          lucide.createIcons({ container: favoriteButton });
        }
      } catch (e) {
        console.error("Error updating favorite status:", e);
        alert("Ошибка при обновлении статуса избранного!");
      }
    });
  }

  // Initial render
  initializeBoardData().then(() => {
    renderScrumColumns();
    renderTasks();
    renderResources();
    updateDisplay();
  });
});
