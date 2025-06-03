
document.addEventListener("DOMContentLoaded", () => {
  config.ui.lucide.initialize();

  // DOM Elements
  const calendarGrid = document.querySelector(".calendar-grid");
  const calendarHeader = document.querySelector(".calendar-header h2");
  const prevMonthBtn = document.querySelector(".prev-month");
  const nextMonthBtn = document.querySelector(".next-month");
  const todayBtn = document.querySelector(".today-btn");
  const monthViewBtn = document.querySelector(".view-btn[data-view='month']");
  const weekViewBtn = document.querySelector(".view-btn[data-view='week']");
  const newEventBtn = document.querySelector(".new-event-btn");
  const newEventModal = document.getElementById("new-event-modal");
  const newEventModalOverlay = document.getElementById("new-event-modal-overlay");
  const eventTitleInput = document.getElementById("event-title");
  const eventStartDateInput = document.getElementById("event-start-date");
  const eventStartTimeInput = document.getElementById("event-start-time");
  const eventEndDateInput = document.getElementById("event-end-date");
  const eventEndTimeInput = document.getElementById("event-end-time");
  const eventBoardSelect = document.getElementById("event-board");
  const eventColorInputs = document.querySelectorAll(".event-color");
  const eventDescriptionInput = document.getElementById("event-description");
  const cancelNewEventBtn = document.querySelector("#new-event-modal .modal-cancel-btn");
  const createEventBtn = document.querySelector("#new-event-modal .modal-save-btn");
  const eventDetailsModal = document.getElementById("event-details-modal");
  const eventDetailsModalOverlay = document.getElementById("event-details-modal-overlay");
  const eventDetailsContent = document.querySelector(".event-details-content");
  const editEventBtn = document.querySelector(".edit-event-btn");
  const deleteEventBtn = document.querySelector(".delete-event-btn");
  const closeEventDetailsBtn = document.querySelector(".close-event-btn");
  const dayDetailsPanel = document.querySelector(".day-details-panel");

  // Calendar state
  let currentDate = new Date();
  let currentView = "month";
  let tasks = [];
  let boards = [];

  // Fetch boards and tasks
  const fetchBoardsAndTasks = async () => {
    try {
      const response = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.boards.list}`,
        {
          method: "GET",
          headers: config.utils.getAuthHeaders(),
        }
      );
      const data = await config.utils.handleResponse(response);
      boards = data.boards || [];
      tasks = boards
        .flatMap((board) =>
          board.columns.flatMap((col) =>
            (col.tasks || []).map((task) => ({
              ...task,
              board_id: board.id,
              board_name: board.name,
            }))
          )
        )
        .filter((task) => task.in_calendar);
      populateBoardSelect();
      renderCalendar();
    } catch (e) {
      console.error("Error fetching boards and tasks:", e);
      alert("Ошибка при загрузке данных!");
    }
  };

  // Populate board select
  const populateBoardSelect = () => {
    if (!eventBoardSelect) return;
    eventBoardSelect.innerHTML = '<option value="">Выберите доску</option>';
    boards.forEach((board) => {
      const option = document.createElement("option");
      option.value = board.id;
      option.textContent = config.utils.sanitizeInput(board.name);
      eventBoardSelect.appendChild(option);
    });
  };

  // Create task (event)
  const createTask = async (taskData) => {
    try {
      const defaultColumn =
        boards
          .find((b) => b.id === taskData.board_id)
          ?.columns.find((c) => c.name.toLowerCase() === "to do") ||
        boards.find((b) => b.id === taskData.board_id)?.columns[0];
      if (!defaultColumn) {
        throw new Error("No default column found for the selected board");
      }
      const response = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.tasks.create(defaultColumn.id)}`,
        {
          method: "POST",
          headers: config.utils.getAuthHeaders(),
          body: JSON.stringify({
            name: taskData.title,
            description: taskData.description || "",
            deadline: taskData.start_time,
            in_calendar: true,
          }),
        }
      );
      const data = await config.utils.handleResponse(response);
      await fetchBoardsAndTasks();
    } catch (e) {
      console.error("Error creating task:", e);
      alert("Ошибка при создании события!");
    }
  };

  // Update task (event)
  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.tasks.update(taskId)}`,
        {
          method: "PATCH",
          headers: config.utils.getAuthHeaders(),
          body: JSON.stringify({
            name: taskData.title,
            description: taskData.description,
            deadline: taskData.start_time,
            in_calendar: true,
          }),
        }
      );
      const data = await config.utils.handleResponse(response);
      await fetchBoardsAndTasks();
    } catch (e) {
      console.error("Error updating task:", e);
      alert("Ошибка при обновлении события!");
    }
  };

  // Delete task (event)
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.tasks.delete(taskId)}`,
        {
          method: "DELETE",
          headers: config.utils.getAuthHeaders(),
        }
      );
      await config.utils.handleResponse(response);
      await fetchBoardsAndTasks();
    } catch (e) {
      console.error("Error deleting task:", e);
      alert("Ошибка при удалении события!");
    }
  };

  // Render calendar
  const renderCalendar = () => {
    if (!calendarGrid || !calendarHeader) return;

    calendarHeader.textContent = currentDate.toLocaleString("ru-RU", {
      month: "long",
      year: "numeric",
    });

    if (currentView === "month") {
      renderMonthView();
    } else {
      renderWeekView();
    }
  };

  // Render month view
  const renderMonthView = () => {
    calendarGrid.innerHTML = "";
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const startDay = firstDayOfMonth.getDay() || 7; // Adjust Sunday (0) to 7
    const daysInMonth = lastDayOfMonth.getDate();

    // Add empty cells for previous month
    for (let i = 1; i < startDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("calendar-day", "empty");
      calendarGrid.appendChild(emptyCell);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("calendar-day");
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      if (dayDate.toDateString() === new Date().toDateString()) {
        dayCell.classList.add("today");
      }
      dayCell.innerHTML = `<span class="day-number">${day}</span>`;

      // Add tasks for this day
      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.deadline);
        return (
          taskDate.getFullYear() === dayDate.getFullYear() &&
          taskDate.getMonth() === dayDate.getMonth() &&
          taskDate.getDate() === dayDate.getDate()
        );
      });

      const eventsContainer = document.createElement("div");
      eventsContainer.classList.add("events-container");
      dayTasks.forEach((task) => {
        const eventEl = document.createElement("div");
        eventEl.classList.add("event");
        eventEl.style.backgroundColor = "#4CAF50"; // Default color
        eventEl.textContent = config.utils.sanitizeInput(task.name);
        eventEl.dataset.taskId = task.id;
        eventEl.addEventListener("click", () => showTaskDetails(task));
        eventsContainer.appendChild(eventEl);
      });
      dayCell.appendChild(eventsContainer);
      calendarGrid.appendChild(dayCell);

      // Click to show day details
      dayCell.addEventListener("click", (e) => {
        if (!e.target.classList.contains("event")) {
          showDayDetails(dayDate);
        }
      });
    }

    config.ui.lucide.initialize({ container: calendarGrid });
  };

  // Render week view
  const renderWeekView = () => {
    calendarGrid.innerHTML = "";
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1));

    // Add day headers
    for (let i = 0; i < 7; i++) {
      const dayHeader = document.createElement("div");
      dayHeader.classList.add("calendar-day", "header");
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      dayHeader.textContent = dayDate.toLocaleString("ru-RU", {
        weekday: "short",
      });
      calendarGrid.appendChild(dayHeader);
    }

    // Add time slots
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        const timeSlot = document.createElement("div");
        timeSlot.classList.add("calendar-time-slot");
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + day);
        slotDate.setHours(hour, 0, 0, 0);

        // Add tasks for this slot
        const slotTasks = tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          return (
            taskDate.getFullYear() === slotDate.getFullYear() &&
            taskDate.getMonth() === slotDate.getMonth() &&
            taskDate.getDate() === slotDate.getDate() &&
            taskDate.getHours() === hour
          );
        });

        slotTasks.forEach((task) => {
          const eventEl = document.createElement("div");
          eventEl.classList.add("event");
          eventEl.style.backgroundColor = "#4CAF50";
          eventEl.textContent = config.utils.sanitizeInput(task.name);
          eventEl.dataset.taskId = task.id;
          eventEl.addEventListener("click", () => showTaskDetails(task));
          timeSlot.appendChild(eventEl);
        });

        calendarGrid.appendChild(timeSlot);
      }
    }

    config.ui.lucide.initialize({ container: calendarGrid });
  };

  // Show day details
  const showDayDetails = (date) => {
    if (!dayDetailsPanel) return;
    dayDetailsPanel.innerHTML = `
      <h3>${date.toLocaleString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}</h3>
    `;
    const dayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });

    if (dayTasks.length === 0) {
      dayDetailsPanel.innerHTML += "<p>Нет событий на этот день.</p>";
    } else {
      const tasksList = document.createElement("ul");
      dayTasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.innerHTML = `
          <span style="color: #4CAF50">●</span>
          ${config.utils.sanitizeInput(task.name)} (${new Date(
          task.deadline
        ).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })})
        `;
        taskItem.style.cursor = "pointer";
        taskItem.addEventListener("click", () => showTaskDetails(task));
        tasksList.appendChild(taskItem);
      });
      dayDetailsPanel.appendChild(tasksList);
    }
  };

  // Show task details
  const showTaskDetails = (task) => {
    if (!eventDetailsModal || !eventDetailsContent || !eventDetailsModalOverlay) return;
    const taskDate = new Date(task.deadline);
    const endDate = new Date(taskDate.getTime() + 60 * 60 * 1000); // +1 hour
    eventDetailsContent.innerHTML = `
      <h3>${config.utils.sanitizeInput(task.name)}</h3>
      <p><strong>Время:</strong> ${taskDate.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
      <p><strong>Доска:</strong> ${config.utils.sanitizeInput(task.board_name)}</p>
      <p><strong>Описание:</strong> ${config.utils.sanitizeInput(
        task.description || "Нет описания"
      )}</p>
    `;
    eventDetailsModal.style.display = "flex";
    eventDetailsModalOverlay.style.display = "block";

    // Edit task
    editEventBtn.onclick = () => {
      eventDetailsModal.style.display = "none";
      eventDetailsModalOverlay.style.display = "none";
      if (
        eventTitleInput &&
        eventStartDateInput &&
        eventStartTimeInput &&
        eventEndDateInput &&
        eventEndTimeInput &&
        eventDescriptionInput &&
        eventBoardSelect &&
        newEventModal &&
        newEventModalOverlay
      ) {
        eventTitleInput.value = task.name;
        eventStartDateInput.value = taskDate.toISOString().slice(0, 10);
        eventStartTimeInput.value = taskDate.toISOString().slice(11, 16);
        eventEndDateInput.value = endDate.toISOString().slice(0, 10);
        eventEndTimeInput.value = endDate.toISOString().slice(11, 16);
        eventDescriptionInput.value = task.description || "";
        eventBoardSelect.value = task.board_id;
        newEventModal.style.display = "flex";
        newEventModalOverlay.style.display = "block";
        eventTitleInput.focus();

        createEventBtn.onclick = async () => {
          const title = eventTitleInput.value.trim();
          const startDateTime = `${eventStartDateInput.value}T${eventStartTimeInput.value}:00`;
          const endDateTime = `${eventEndDateInput.value}T${eventEndTimeInput.value}:00`;
          const description = eventDescriptionInput.value.trim();
          const boardId = eventBoardSelect.value;

          if (title && startDateTime && endDateTime && boardId) {
            await updateTask(task.id, {
              title,
              description,
              start_time: startDateTime,
            });
            newEventModal.style.display = "none";
            newEventModalOverlay.style.display = "none";
          } else {
            alert("Заполните все обязательные поля!");
          }
        };
      }
    };

    // Delete task
    deleteEventBtn.onclick = async () => {
      if (confirm(`Удалить событие "${config.utils.sanitizeInput(task.name)}"?`)) {
        await deleteTask(task.id);
        eventDetailsModal.style.display = "none";
        eventDetailsModalOverlay.style.display = "none";
      }
    };

    // Close task details
    closeEventDetailsBtn.onclick = () => {
      eventDetailsModal.style.display = "none";
      eventDetailsModalOverlay.style.display = "none";
    };
  };

  // New event modal handling
  if (newEventBtn && newEventModal && newEventModalOverlay) {
    newEventBtn.addEventListener("click", () => {
      if (
        eventTitleInput &&
        eventStartDateInput &&
        eventStartTimeInput &&
        eventEndDateInput &&
        eventEndTimeInput &&
        eventDescriptionInput &&
        eventBoardSelect
      ) {
        eventTitleInput.value = "";
        eventStartDateInput.value = new Date().toISOString().slice(0, 10);
        eventStartTimeInput.value = new Date().toTimeString().slice(0, 5);
        eventEndDateInput.value = new Date().toISOString().slice(0, 10);
        eventEndTimeInput.value = new Date(
          new Date().getTime() + 60 * 60 * 1000
        )
          .toTimeString()
          .slice(0, 5);
        eventDescriptionInput.value = "";
        eventBoardSelect.value = "";
        newEventModal.style.display = "flex";
        newEventModalOverlay.style.display = "block";
        eventTitleInput.focus();
      }
    });

    createEventBtn.addEventListener("click", async () => {
      const title = eventTitleInput.value.trim();
      const startDateTime = `${eventStartDateInput.value}T${eventStartTimeInput.value}:00`;
      const endDateTime = `${eventEndDateInput.value}T${eventEndTimeInput.value}:00`;
      const description = eventDescriptionInput.value.trim();
      const boardId = eventBoardSelect.value;

      if (title && startDateTime && endDateTime && boardId) {
        await createTask({
          title,
          description,
          start_time: startDateTime,
          board_id: boardId,
        });
        newEventModal.style.display = "none";
        newEventModalOverlay.style.display = "none";
      } else {
        alert("Заполните все обязательные поля!");
      }
    });

    cancelNewEventBtn.addEventListener("click", () => {
      newEventModal.style.display = "none";
      newEventModalOverlay.style.display = "none";
    });

    newEventModalOverlay.addEventListener("click", () => {
      newEventModal.style.display = "none";
      newEventModalOverlay.style.display = "none";
    });
  }

  // Navigation and view handling
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      currentDate = new Date();
      renderCalendar();
    });
  }

  if (monthViewBtn && weekViewBtn) {
    monthViewBtn.addEventListener("click", () => {
      currentView = "month";
      monthViewBtn.classList.add("active");
      weekViewBtn.classList.remove("active");
      renderCalendar();
    });

    weekViewBtn.addEventListener("click", () => {
      currentView = "week";
      weekViewBtn.classList.add("active");
      monthViewBtn.classList.remove("active");
      renderCalendar();
    });
  }

  // Escape key to close modals
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (newEventModal && newEventModal.style.display === "flex") {
        newEventModal.style.display = "none";
        newEventModalOverlay.style.display = "none";
      }
      if (eventDetailsModal && eventDetailsModal.style.display === "flex") {
        eventDetailsModal.style.display = "none";
        eventDetailsModalOverlay.style.display = "none";
      }
    }
  });

  // Initial load
  fetchBoardsAndTasks();
});
