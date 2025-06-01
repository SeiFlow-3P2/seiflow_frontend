<script src="https://unpkg.com/lucide@latest"></script>

  // Инициализация иконок
  lucide.createIcons();
  let selectedColor = 'blue';
  
  // Хранение событий
  let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  let currentDate = new Date();
  let selectedCategory = null;

  // Обработчики выбора цвета
document.querySelectorAll('.color-option').forEach(option => {
option.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.remove('active');
  });
  option.classList.add('active');
  selectedColor = option.dataset.color;
  document.getElementById('eventColor').value = selectedColor;
});
});

function saveEvents() {
localStorage.setItem('calendarEvents', JSON.stringify(events));
}
  // DOM элементы
  const monthGrid = document.getElementById('monthGrid');
  const currentMonthElement = document.getElementById('currentMonth');
  const prevMonthButton = document.getElementById('prevMonth');
  const nextMonthButton = document.getElementById('nextMonth');
  const todayButton = document.getElementById('todayButton');
  const newEventButton = document.getElementById('newEventButton');
  const eventModal = document.getElementById('eventModal');
  const closeModalButton = document.getElementById('closeModal');
  const cancelButton = document.getElementById('cancelButton');
  const eventForm = document.getElementById('eventForm');
  const categoryTags = document.querySelectorAll('.category-tag');
  const eventCategoryInput = document.getElementById('eventCategory');

  // Обработчик для кнопки создания нового события
  newEventButton.addEventListener('click', () => {
// Сбрасываем форму
eventForm.reset();

// Сбрасываем выбранную категорию
selectedCategory = null;
document.querySelectorAll('.category-tag').forEach(tag => {
  tag.classList.remove('active');
});

 document.querySelectorAll('.color-option').forEach(opt => {
opt.classList.remove('active');
});
document.querySelector('.color-option.blue').classList.add('active');
document.getElementById('eventColor').value = 'blue';
selectedColor = 'blue';

// Устанавливаем текущую дату по умолчанию
const today = new Date();
const formattedDate = today.toISOString().split('T')[0];
document.getElementById('startDate').value = formattedDate;
document.getElementById('endDate').value = formattedDate;

// Сбрасываем заголовок и текст кнопки
eventModal.querySelector('h3').textContent = 'Новое событие';
eventModal.querySelector('.submit-button').textContent = 'Создать';

// Удаляем атрибуты редактирования
delete eventModal.dataset.editMode;
delete eventModal.dataset.eventId;

eventModal.classList.remove('hidden');
});

// Обработчики переключения видов
document.querySelectorAll('.view-button').forEach(button => {
button.addEventListener('click', function() {
  // Управление активными кнопками
  document.querySelectorAll('.view-button').forEach(btn => btn.classList.remove('active'));
  this.classList.add('active');
  
  // Получаем элементы навигации
  const dateNav = document.querySelector('.date-navigation');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const todayBtn = document.getElementById('todayButton');
  const currentMonth = document.getElementById('currentMonth');
  
  // Скрываем все виды календаря
  document.querySelectorAll('.calendar-view').forEach(view => view.classList.add('hidden'));
  
  // Показываем выбранный вид
  const view = this.dataset.view;
  document.getElementById(`${view}View`).classList.remove('hidden');
  
  // Управляем видимостью элементов навигации
  if (view === 'month') {
    // Показываем все элементы навигации для месячного вида
    prevMonthBtn.style.display = 'block';
    nextMonthBtn.style.display = 'block';
    todayBtn.style.display = 'block';
    currentMonth.style.display = 'block';
  } else if (view === 'week') {
    // Скрываем кнопки навигации для недельного вида, оставляем только заголовок
    prevMonthBtn.style.display = 'none';
    nextMonthBtn.style.display = 'none';
    todayBtn.style.display = 'none';
    currentMonth.style.display = 'block'; // Оставляем заголовок видимым
  }
  
  // Обновляем выбранный вид
  if (view === 'month') {
    renderCalendar();
  } else if (view === 'week') {
    renderWeekView(currentDate);
  }
});
});




document.querySelector('.search-input').addEventListener('input', function(e) {
  const searchTerm = e.target.value.trim().toLowerCase();
  
  // Получаем все события календаря
  const allEvents = document.querySelectorAll('.event');
  
  // Если поисковая строка пустая - показываем все события
  if (searchTerm === '') {
    allEvents.forEach(event => {
      event.style.display = 'block';
    });
    return;
  }
  
  // Ищем совпадения по первым символам
  allEvents.forEach(event => {
    const eventText = event.textContent.toLowerCase();
    
    // Проверяем, начинается ли текст события с поискового запроса
    if (eventText.startsWith(searchTerm)) {
      event.style.display = 'block';
    } else {
      event.style.display = 'none';
    }
  });
});




// Инициализация
document.addEventListener('DOMContentLoaded', function() {
// Устанавливаем активной кнопку "Месяц" по умолчанию
document.querySelector('.view-button[data-view="month"]').classList.add('active');

// Показываем все элементы навигации, так как по умолчанию выбран месячный вид
document.getElementById('prevMonth').style.display = 'block';
document.getElementById('nextMonth').style.display = 'block';
document.getElementById('todayButton').style.display = 'block';
document.getElementById('currentMonth').style.display = 'block';

// Показываем месячный вид по умолчанию
document.getElementById('monthView').classList.remove('hidden');

// Скрываем недельный вид
document.getElementById('weekView').classList.add('hidden');

// Инициализируем календарь
renderCalendar();
});




// Функция для отображения недели (адаптированная под вашу структуру)
function renderWeekView(date) {
const weekGrid = document.querySelector('.week-grid');
if (!weekGrid) return;

// Находим понедельник текущей недели
const monday = new Date(date);
monday.setDate(date.getDate() - (date.getDay() + 6) % 7);

// Очищаем сетку недели
weekGrid.innerHTML = '';

// Создаем дни недели
for (let i = 0; i < 7; i++) {
  const day = new Date(monday);
  day.setDate(monday.getDate() + i);
  
  const dayCell = document.createElement('div');
  dayCell.className = 'week-day';
  
  // Заголовок дня
  const dayHeader = document.createElement('div');
  dayHeader.className = 'week-day-header';
  
  const weekdayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  dayHeader.innerHTML = `
    <div class="week-day-name">${weekdayNames[day.getDay()]}</div>
    <div class="week-day-number ${isToday(day) ? 'today' : ''}">${day.getDate()}</div>
  `;
  
  // Контейнер для событий
  const eventsContainer = document.createElement('div');
  eventsContainer.className = 'week-day-events';
  
  // Добавляем события для этого дня
  const formattedDate = formatDate(day);
  const dayEvents = events.filter(event => event.startDate === formattedDate);
  
  dayEvents.forEach(event => {
    const eventElement = document.createElement('div');
    eventElement.className = `week-event ${event.color || 'blue'}`;
    eventElement.innerHTML = `
      <div class="week-event-time">${event.startTime || 'Весь день'}</div>
      <div class="week-event-title">${event.title}</div>
    `;
    eventsContainer.appendChild(eventElement);
  });
  
  dayCell.appendChild(dayHeader);
  dayCell.appendChild(eventsContainer);
  weekGrid.appendChild(dayCell);
}
}

// Вспомогательные функции (оставляем без изменений)
function formatDate(date) {
return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function isToday(date) {
const today = new Date();
return date.getDate() === today.getDate() && 
       date.getMonth() === today.getMonth() && 
       date.getFullYear() === today.getFullYear();
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
// Убедимся, что у нас есть начальные данные
if (!events || events.length === 0) {
  events = [
    {
      title: "Пример события",
      startDate: formatDate(new Date()),
      startTime: "10:00",
      color: "blue"
    }
  ];
}

// Показываем месячный вид по умолчанию
document.querySelector('.view-button[data-view="month"]').classList.add('active');
document.getElementById('monthView').classList.remove('hidden');
});


// Обработчик отправки формы (оставляем как есть, но убедимся, что он сбрасывает форму)
eventForm.addEventListener('submit', (e) => {
e.preventDefault();

const isEditMode = eventModal.dataset.editMode === 'true';
const eventId = isEditMode ? parseInt(eventModal.dataset.eventId) : Date.now();

const newEvent = {
  id: eventId,
  title: document.getElementById('eventTitle').value,
  startDate: document.getElementById('startDate').value,
  startTime: document.getElementById('startTime').value,
  endDate: document.getElementById('endDate').value || document.getElementById('startDate').value,
  endTime: document.getElementById('endTime').value,
  board: document.getElementById('eventBoard').value,
  category: selectedCategory,
  color: document.getElementById('eventColor').value, // Сохраняем выбранный цвет
  description: document.getElementById('eventDescription').value
};

if (isEditMode) {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = newEvent;
  }
} else {
  events.push(newEvent);
}

renderCalendar();
eventModal.classList.add('hidden');
eventForm.reset();

// Сбрасываем состояние формы, но не сбрасываем цвет
delete eventModal.dataset.editMode;
delete eventModal.dataset.eventId;
eventModal.querySelector('h3').textContent = 'Новое событие';
eventModal.querySelector('.submit-button').textContent = 'Создать';

// Сбрасываем выбранную категорию
selectedCategory = null;
document.querySelectorAll('.category-tag').forEach(tag => {
  tag.classList.remove('active');
});
});


function formatDateForComparison(dateString) {
const [year, month, day] = dateString.split('-');
return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

closeModalButton.addEventListener('click', () => {
eventModal.classList.add('hidden');
eventForm.reset();
selectedCategory = null;
document.querySelectorAll('.category-tag').forEach(tag => {
  tag.classList.remove('active');
});
});

cancelButton.addEventListener('click', () => {
eventModal.classList.add('hidden');
eventForm.reset();
selectedCategory = null;
document.querySelectorAll('.category-tag').forEach(tag => {
  tag.classList.remove('active');
});
});

  // Навигация по месяцам
  prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  todayButton.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
  });

  // Рендер календаря
  function renderCalendar() {
    // Очищаем календарь
    monthGrid.innerHTML = '';
    
    // Устанавливаем заголовок текущего месяца
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", 
                       "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Получаем первый день месяца и день недели
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Пн=0, Вс=6
    
    // Получаем последний день месяца
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем последний день предыдущего месяца
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const daysInPrevMonth = prevMonthLastDay.getDate();
    
    // Добавляем дни предыдущего месяца
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      addDayToCalendar(date, day, true);
    }
    
    // Добавляем дни текущего месяца
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
      addDayToCalendar(date, day, false, isToday);
    }
    
    // Добавляем дни следующего месяца
    const daysToAdd = 42 - (firstDayOfWeek + daysInMonth);
    for (let day = 1; day <= daysToAdd; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      addDayToCalendar(date, day, true);
    }
  }

  // Добавление дня в календарь
function addDayToCalendar(date, day, isOtherMonth, isToday = false) {
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    
    if (isOtherMonth) {
      dayCell.classList.add('other-month');
    }
    
    if (isToday) {
      dayCell.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);
    
    // Форматируем дату для сравнения
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // Добавляем события для этого дня
    const dayEvents = events.filter(event => event.startDate === formattedDate);
    
    dayEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = `event ${event.color || 'blue'}`; // Используем event.color
      eventElement.textContent = event.title;
      eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventDetails(event);
      });
      dayCell.appendChild(eventElement);
    });
    
    // Добавляем обработчик клика на ячейку дня
    dayCell.addEventListener('click', () => {
      showDayDetails(date, dayEvents);
    });
    
    monthGrid.appendChild(dayCell);
  }

  // Функция для отображения деталей дня
  function showDayDetails(date, dayEvents) {
    const dayDetails = document.getElementById('dayDetails');
    const hourlyView = document.getElementById('hourlyView');
    const dayDetailsTitle = document.getElementById('dayDetailsTitle');
    
    // Устанавливаем заголовок
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dayDetailsTitle.textContent = date.toLocaleDateString('ru-RU', options);
    
    // Очищаем предыдущие данные
    hourlyView.innerHTML = '';
    
    // Создаем часовые слоты
    for (let hour = 0; hour < 24; hour++) {
      const hourSlot = document.createElement('div');
      hourSlot.className = 'hour-slot';
      
      const hourLabel = document.createElement('div');
      hourLabel.className = 'hour-label';
      hourLabel.textContent = `${hour}:00 - ${hour+1}:00`;
      hourSlot.appendChild(hourLabel);
      
      // Находим события для этого часа
      const hourEvents = dayEvents.filter(event => {
        if (!event.startTime) return false;
        const eventHour = parseInt(event.startTime.split(':')[0]);
        return eventHour === hour;
      });
      
      // Добавляем события
      hourEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'hour-event';
        eventElement.textContent = `${event.startTime} - ${event.title}`;
        eventElement.addEventListener('click', (e) => {
          e.stopPropagation();
          showEventDetails(event);
        });
        hourSlot.appendChild(eventElement);
      });
      
      // Кнопка добавления нового события
      const addEventBtn = document.createElement('button');
      addEventBtn.className = 'add-event-btn';
      addEventBtn.innerHTML = '<i data-lucide="plus"></i> Добавить событие';
      addEventBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddEventModalForHour(date, hour);
      });
      hourSlot.appendChild(addEventBtn);
      
      hourlyView.appendChild(hourSlot);
    }
    
    // Показываем панель
    dayDetails.classList.add('active');
    // Обновляем иконки
    lucide.createIcons();
  }

  // Функция для открытия модального окна добавления события с предустановленным временем
  function openAddEventModalForHour(date, hour) {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour+1).toString().padStart(2, '0')}:00`;
    
    document.getElementById('startDate').value = formattedDate;
    document.getElementById('endDate').value = formattedDate;
    document.getElementById('startTime').value = startTime;
    document.getElementById('endTime').value = endTime;
    
    eventModal.classList.remove('hidden');
    document.getElementById('eventTitle').focus();
  }

  // Закрытие панели деталей дня
  document.getElementById('closeDayDetails').addEventListener('click', () => {
    document.getElementById('dayDetails').classList.remove('active');
});

    // Обновленная функция показа деталей события
    function showEventDetails(event) {
    const modal = document.getElementById('eventDetailsModal');
    const title = document.getElementById('eventDetailsTitle');
    const content = document.getElementById('eventDetailsContent');
    
    // Заполняем заголовок
    title.textContent = event.title;
    
    // Заполняем содержимое
    content.innerHTML = `
  <div class="event-details-row">
    <div class="event-details-label">Название:</div>
    <div class="event-details-value">${event.title}</div>
  </div>
  <div class="event-details-row">
    <div class="event-details-label">Дата:</div>
    <div class="event-details-value">${formatEventDate(event.startDate, event.startTime, event.endDate, event.endTime)}</div>
  </div>
  ${event.board ? `
  <div class="event-details-row">
    <div class="event-details-label">Доска:</div>
    <div class="event-details-value">${getBoardName(event.board)}</div>
  </div>` : ''}
  <div class="event-details-row">
    <div class="event-details-label">Цвет:</div>
    <div class="event-details-value">
      <div class="color-preview" style="background-color: ${getColorHex(event.color)}; width: 20px; height: 20px; border-radius: 50%; display: inline-block;"></div>
      ${getColorName(event.color)}
    </div>
  </div>
  ${event.description ? `
  <div class="event-details-row">
    <div class="event-details-label">Описание:</div>
    <div class="event-details-value">${event.description}</div>
  </div>` : ''}
`;
    
    // Сохраняем текущее событие в data-атрибуте
    modal.dataset.eventId = event.id.toString();
    modal.classList.remove('hidden');
    
    // Показываем модальное окно
    modal.classList.remove('hidden');
    lucide.createIcons();
  }

  // Функции для форматирования данных
  function formatEventDate(startDate, startTime, endDate, endTime) {
    const start = new Date(`${startDate}T${startTime || '00:00'}`);
    const end = new Date(`${endDate || startDate}T${endTime || '23:59'}`);
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // Если событие на весь день
    if (!startTime && !endTime) {
      return start.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    }
    
    // Если событие в один день
    if (startDate === endDate || !endDate) {
      return `${start.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}, ${start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})} - ${end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`;
    }
    
    // Если событие на несколько дней
    return `${start.toLocaleString('ru-RU', options)} - ${end.toLocaleString('ru-RU', options)}`;
  }

  function getBoardName(boardId) {
    const boards = {
      'spanish': 'Изучение испанского языка',
      'ielts': 'Подготовка к IELTS',
      'fitness': 'Фитнес-челлендж',
      'finance': 'Личные финансы'
    };
    return boards[boardId] || boardId;
  }
  function getColorHex(color) {
const colors = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6'
};
return colors[color] || '#3b82f6';
}

function getColorName(color) {
const names = {
  blue: 'Синий',
  red: 'Красный',
  green: 'Зеленый',
  yellow: 'Желтый',
  purple: 'Фиолетовый'
};
return names[color] || 'Синий';
}

  // Обработчики для кнопок модального окна события
  document.getElementById('closeEventDetails').addEventListener('click', () => {
    document.getElementById('eventDetailsModal').classList.add('hidden');
  });

  document.getElementById('closeEventDetailsButton').addEventListener('click', () => {
    document.getElementById('eventDetailsModal').classList.add('hidden');
  });

  document.getElementById('editEventButton').addEventListener('click', () => {
const modal = document.getElementById('eventDetailsModal');
const eventId = parseInt(modal.dataset.eventId);
const event = events.find(e => e.id === eventId);

if (event) {
  // Заполняем форму данными события
  document.getElementById('eventTitle').value = event.title;
  document.getElementById('startDate').value = event.startDate;
  document.getElementById('startTime').value = event.startTime || '';
  document.getElementById('endDate').value = event.endDate || event.startDate;
  document.getElementById('endTime').value = event.endTime || '';
  document.getElementById('eventBoard').value = event.board || '';
  document.getElementById('eventDescription').value = event.description || '';
  
  // Устанавливаем категорию
  if (event.category) {
    document.querySelectorAll('.category-tag').forEach(tag => {
      tag.classList.remove('active');
      if (tag.dataset.category === event.category) {
        tag.classList.add('active');
      }
    });
    selectedCategory = event.category;
  }
  
  // Устанавливаем цвет
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.dataset.color === (event.color || 'blue')) {
      opt.classList.add('active');
      document.getElementById('eventColor').value = event.color || 'blue';
      selectedColor = event.color || 'blue';
    }
  });

  // Закрываем модальное окно просмотра
  modal.classList.add('hidden');
  
  // Открываем модальное окно редактирования
  const editModal = document.getElementById('eventModal');
  editModal.classList.remove('hidden');
  editModal.querySelector('h3').textContent = 'Редактировать событие';
  editModal.querySelector('.submit-button').textContent = 'Сохранить';
  editModal.dataset.editMode = 'true';
  editModal.dataset.eventId = eventId;
}
});

document.getElementById('deleteEventButton').addEventListener('click', function(e) {
e.preventDefault();
e.stopPropagation();

const modal = document.getElementById('eventDetailsModal');
const eventId = parseInt(modal.dataset.eventId);

if (confirm('Вы уверены, что хотите удалить это событие?')) {
  const index = events.findIndex(e => e.id === eventId);
  
  if (index !== -1) {
    events.splice(index, 1);
    saveEvents(); // Сохраняем изменения
    
    renderCalendar();
    modal.classList.add('hidden');
    document.getElementById('dayDetails').classList.remove('active');
    
    console.log('Событие удалено. Текущие события:', events);
    lucide.createIcons();
  }
}
});


  // В обработчике отправки формы обновите создание события:
eventForm.addEventListener('submit', (e) => {
e.preventDefault();

const isEditMode = eventModal.dataset.editMode === 'true';
const eventId = isEditMode ? parseInt(eventModal.dataset.eventId) : Date.now();

const newEvent = {
  id: eventId,
  title: document.getElementById('eventTitle').value,
  startDate: document.getElementById('startDate').value,
  startTime: document.getElementById('startTime').value,
  endDate: document.getElementById('endDate').value || document.getElementById('startDate').value,
  endTime: document.getElementById('endTime').value,
  board: document.getElementById('eventBoard').value,
  color: document.getElementById('eventColor').value, // Сохраняем выбранный цвет
  description: document.getElementById('eventDescription').value
};

if (isEditMode) {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = newEvent;
    saveEvents(); 
  }
} else {
  events.push(newEvent);
  saveEvents();
}

renderCalendar();
eventModal.classList.add('hidden');
eventForm.reset();

// Сбрасываем цвет к синему
document.querySelectorAll('.color-option').forEach(opt => {
  opt.classList.remove('active');
});
document.querySelector('.color-option.blue').classList.add('active');
document.getElementById('eventColor').value = 'blue';
selectedColor = 'blue';
});



  // Инициализация календаря
  renderCalendar();
