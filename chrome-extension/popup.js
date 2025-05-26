document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Стандартные исключенные чаты
  const DEFAULT_EXCLUDED_CHATS = [
    'Правила игры в тринку',
    'Ответственность при повреждении машины',
  ];

  // Элементы DOM
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const newChatInput = document.getElementById('new-chat-input');
  const addChatButton = document.getElementById('add-chat-btn');
  const excludedList = document.getElementById('excluded-list');
  const resetButton = document.getElementById('reset-excluded-btn');

  // Инициализация
  initializeTabs();
  loadExcludedChats();

  /** Инициализация табов */
  function initializeTabs() {
    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        switchToTab(targetTab);
      });
    });
  }

  /** Переключение между табами */
  function switchToTab(targetTabName) {
    // Убираем активный класс со всех кнопок и контента
    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    // Добавляем активный класс к выбранным элементам
    const activeButton = document.querySelector(
      `[data-tab="${targetTabName}"]`
    );
    const activeContent = document.getElementById(`${targetTabName}-tab`);

    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeContent.classList.add('active');
    }

    // Если переключились на таб исключений, обновляем список
    if (targetTabName === 'excluded') {
      loadExcludedChats();
    }
  }

  /** Загрузка исключенных чатов из storage */
  async function loadExcludedChats() {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const excludedChats = result.excludedChats || DEFAULT_EXCLUDED_CHATS;
      renderExcludedList(excludedChats);
    } catch (error) {
      console.error('Ошибка загрузки исключенных чатов:', error);
      renderExcludedList(DEFAULT_EXCLUDED_CHATS);
    }
  }

  /** Сохранение исключенных чатов в storage */
  async function saveExcludedChats(excludedChats) {
    try {
      await chrome.storage.sync.set({ excludedChats });
      console.log('Исключенные чаты сохранены:', excludedChats);

      // Уведомляем content script об изменениях
      notifyContentScriptAboutChanges(excludedChats);
    } catch (error) {
      console.error('Ошибка сохранения исключенных чатов:', error);
    }
  }

  /** Уведомление content script об изменениях */
  async function notifyContentScriptAboutChanges(excludedChats) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (
        tab &&
        (tab.url.includes('chatgpt.com') || tab.url.includes('chat.openai.com'))
      ) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXCLUDED_CHATS_UPDATED',
          excludedChats: excludedChats,
        });
      }
    } catch (error) {
      console.log('Content script не найден или не активен');
    }
  }

  /** Отрисовка списка исключенных чатов */
  function renderExcludedList(excludedChats) {
    excludedList.innerHTML = '';

    if (!excludedChats || excludedChats.length === 0) {
      excludedList.innerHTML =
        '<div class="empty-state">Немає збережених чатів</div>';
      return;
    }

    excludedChats.forEach((chatTitle, index) => {
      const itemElement = createExcludedItem(chatTitle, index);
      excludedList.appendChild(itemElement);
    });
  }

  /** Создание элемента исключенного чата */
  function createExcludedItem(chatTitle, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'excluded-item';
    itemDiv.innerHTML = `
      <div class="excluded-item-text">${escapeHtml(chatTitle)}</div>
      <div class="excluded-item-actions">
        <button class="edit-btn" data-index="${index}">✏️</button>
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;

    // Обработчики событий
    const editButton = itemDiv.querySelector('.edit-btn');
    const deleteButton = itemDiv.querySelector('.delete-btn');

    editButton.addEventListener('click', () => editExcludedChat(index));
    deleteButton.addEventListener('click', () => deleteExcludedChat(index));

    return itemDiv;
  }

  /** Экранирование HTML */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Добавление нового исключенного чата */
  async function addExcludedChat() {
    const newChatTitle = newChatInput.value.trim();

    if (!newChatTitle) {
      alert('Введіть назву чату');
      return;
    }

    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const currentExcluded = result.excludedChats || DEFAULT_EXCLUDED_CHATS;

      // Проверяем, нет ли уже такого чата
      if (
        currentExcluded.some(
          (chat) => chat.toLowerCase() === newChatTitle.toLowerCase()
        )
      ) {
        alert('Такий чат вже є в списку збережених');
        return;
      }

      const updatedExcluded = [...currentExcluded, newChatTitle];
      await saveExcludedChats(updatedExcluded);

      newChatInput.value = '';
      renderExcludedList(updatedExcluded);
    } catch (error) {
      console.error('Ошибка добавления чата:', error);
      alert('Помилка при додаванні чату');
    }
  }

  /** Редактирование исключенного чата */
  async function editExcludedChat(index) {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const currentExcluded = result.excludedChats || DEFAULT_EXCLUDED_CHATS;

      const currentTitle = currentExcluded[index];
      const newTitle = prompt('Редагувати назву чату:', currentTitle);

      if (newTitle === null) return; // Отмена

      const trimmedTitle = newTitle.trim();
      if (!trimmedTitle) {
        alert('Назва чату не може бути порожньою');
        return;
      }

      // Проверяем на дубликаты (исключая текущий элемент)
      const otherChats = currentExcluded.filter((_, i) => i !== index);
      if (
        otherChats.some(
          (chat) => chat.toLowerCase() === trimmedTitle.toLowerCase()
        )
      ) {
        alert('Такий чат вже є в списку збережених');
        return;
      }

      const updatedExcluded = [...currentExcluded];
      updatedExcluded[index] = trimmedTitle;

      await saveExcludedChats(updatedExcluded);
      renderExcludedList(updatedExcluded);
    } catch (error) {
      console.error('Ошибка редактирования чата:', error);
      alert('Помилка при редагуванні чату');
    }
  }

  /** Удаление исключенного чата */
  async function deleteExcludedChat(index) {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const currentExcluded = result.excludedChats || DEFAULT_EXCLUDED_CHATS;

      const chatTitle = currentExcluded[index];
      if (!confirm(`Видалити "${chatTitle}" зі збережених чатів?`)) {
        return;
      }

      const updatedExcluded = currentExcluded.filter((_, i) => i !== index);
      await saveExcludedChats(updatedExcluded);
      renderExcludedList(updatedExcluded);
    } catch (error) {
      console.error('Ошибка удаления чата:', error);
      alert('Помилка при видаленні чату');
    }
  }

  /** Сброс к стандартным исключенным чатам */
  async function resetToDefaultExcluded() {
    if (
      !confirm(
        'Скинути список збережених чатів до стандартного? Всі ваші зміни будуть втрачені.'
      )
    ) {
      return;
    }

    try {
      await saveExcludedChats(DEFAULT_EXCLUDED_CHATS);
      renderExcludedList(DEFAULT_EXCLUDED_CHATS);
    } catch (error) {
      console.error('Ошибка сброса к стандартным чатам:', error);
      alert('Помилка при скиданні до стандартних чатів');
    }
  }

  // Обработчики событий
  addChatButton.addEventListener('click', addExcludedChat);
  resetButton.addEventListener('click', resetToDefaultExcluded);

  // Добавление чата по Enter
  newChatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addExcludedChat();
    }
  });
});
