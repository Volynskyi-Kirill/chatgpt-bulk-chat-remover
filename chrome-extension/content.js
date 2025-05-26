(function () {
  'use strict';

  // Стандартные исключаемые чаты
  const DEFAULT_EXCLUDED_CHATS = [];

  // Текущий список исключаемых чатов (будет загружен из storage)
  let currentExcludedChats = DEFAULT_EXCLUDED_CHATS.map((chat) =>
    chat.toLowerCase()
  );

  // Глобальные переменные
  let isUIAdded = false;
  let capturedAccessToken = null;

  /** Утилитная функция для ожидания */
  function waitForTime(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /** Загрузка исключенных чатов из chrome.storage */
  async function loadExcludedChatsFromStorage() {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const excludedChats = result.excludedChats || DEFAULT_EXCLUDED_CHATS;
      currentExcludedChats = excludedChats.map((chat) => chat.toLowerCase());
      console.log('🔄 Загружены исключенные чаты:', currentExcludedChats);
    } catch (error) {
      console.error('❌ Ошибка загрузки исключенных чатов:', error);
      currentExcludedChats = DEFAULT_EXCLUDED_CHATS.map((chat) =>
        chat.toLowerCase()
      );
    }
  }

  /** Обработка сообщений от popup */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXCLUDED_CHATS_UPDATED') {
      currentExcludedChats = message.excludedChats.map((chat) =>
        chat.toLowerCase()
      );
      console.log('🔄 Обновлены исключенные чаты:', currentExcludedChats);
      sendResponse({ success: true });
    }
  });

  /** Создание или обновление индикатора статуса */
  function createOrUpdateStatusIndicator(statusText) {
    let statusElement = document.querySelector('#gpt-bulk-status-indicator');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'gpt-bulk-status-indicator';
      statusElement.style.marginTop = '6px';
      statusElement.style.fontStyle = 'italic';
      statusElement.style.color = '#169800';
      statusElement.style.fontWeight = 'bold';
      document.body.prepend(statusElement);
    }
    statusElement.textContent = statusText;
    return statusElement;
  }

  /** Инъекция скрипта для перехвата fetch */
  function injectFetchInterceptor() {
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL('injected.js');
    scriptElement.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(scriptElement);

    // Слушаем сообщения от инъектированного скрипта
    window.addEventListener('message', function (event) {
      if (event.source !== window) return;

      if (event.data.type && event.data.type === 'GPT_TOKEN_CAPTURED') {
        capturedAccessToken = event.data.token;
        console.log('🗝️ Токен успешно перехвачен:', capturedAccessToken);
      }
    });
  }

  /** Ожидание появления боковой панели навигации */
  function waitForNavigationSidebar() {
    const checkInterval = setInterval(() => {
      console.log('🔍 Поиск навигационной панели...');
      const navigationBlock = document.querySelector(
        'nav.group\\/scrollport, nav.group\\/scrollport.relative'
      );

      if (navigationBlock) {
        console.log('✅ Навигационная панель найдена:', navigationBlock);
      } else {
        console.warn('❌ Навигационная панель не найдена');
      }

      if (navigationBlock && !isUIAdded) {
        isUIAdded = true;
        addUserInterface(navigationBlock);
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  /** Добавление пользовательского интерфейса */
  function addUserInterface(containerElement) {
    const wrapperElement = document.createElement('div');
    wrapperElement.style.padding = '10px';
    wrapperElement.style.margin = '10px 0 10px 0';
    wrapperElement.style.background = '#f2f2f2';
    wrapperElement.style.border = '1px solid #ccc';
    wrapperElement.style.borderRadius = '5px';
    wrapperElement.style.fontSize = '14px';
    wrapperElement.style.display = 'flex';
    wrapperElement.style.gap = '6px';

    const scrollButton = document.createElement('button');
    scrollButton.textContent = '📜 Прокрутити всі чати';
    scrollButton.onclick = scrollToBottomAndLoadChats;

    const selectButton = document.createElement('button');
    selectButton.textContent = '✅ Виділити всі';
    selectButton.onclick = () => {
      document.querySelectorAll('.gpt-chat-checkbox').forEach((checkbox) => {
        const chatLink = checkbox.closest('a[draggable="true"]');
        // Находим элемент с заголовком чата
        const titleElement = chatLink.querySelector('.truncate');
        const chatTitle = titleElement?.textContent.trim().toLowerCase() || '';

        checkbox.checked = !currentExcludedChats.includes(chatTitle);
      });
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑 Видалити обрані';
    deleteButton.onclick = deleteSelectedChats;

    wrapperElement.appendChild(scrollButton);
    wrapperElement.appendChild(selectButton);
    wrapperElement.appendChild(deleteButton);

    containerElement.prepend(wrapperElement);

    // Добавляем элемент статуса под меню
    const statusElement = document.createElement('div');
    statusElement.id = 'gpt-bulk-status-indicator';
    statusElement.style.marginTop = '6px';
    statusElement.style.fontStyle = 'italic';
    statusElement.style.color = '#169800';
    statusElement.style.fontWeight = 'bold';
    containerElement.prepend(statusElement);
  }

  /** Прокрутка до конца списка чатов для загрузки всех */
  async function scrollToBottomAndLoadChats() {
    const scrollableElement = document.querySelector(
      'nav.group\\/scrollport, nav.group\\/scrollport.relative'
    );
    if (!scrollableElement) return;

    const statusElement = createOrUpdateStatusIndicator('⏳ Завантаження...');
    let previousHeight = 0;
    let unchangedHeightCount = 0;

    for (
      let iteration = 0;
      iteration < 50 && unchangedHeightCount < 5;
      iteration++
    ) {
      scrollableElement.scrollTo({
        top: scrollableElement.scrollHeight,
        behavior: 'smooth',
      });
      await waitForTime(500);

      const currentHeight = scrollableElement.scrollHeight;
      if (currentHeight === previousHeight) {
        unchangedHeightCount++;
      } else {
        unchangedHeightCount = 0;
      }

      previousHeight = currentHeight;
    }

    addCheckboxesToChats();
    statusElement.textContent = '✅ Усі чати завантажено!';
  }

  /** Добавление чекбоксов к чатам */
  function addCheckboxesToChats() {
    const chatLinkElements = document.querySelectorAll(
      'aside[aria-labelledby] a[draggable="true"]'
    );

    chatLinkElements.forEach((chatLink) => {
      // Пропускаем, если чекбокс уже добавлен
      if (chatLink.querySelector('.gpt-chat-checkbox')) return;

      // Создаём чекбокс
      const checkboxElement = document.createElement('input');
      checkboxElement.type = 'checkbox';
      checkboxElement.className = 'gpt-chat-checkbox';
      checkboxElement.style.marginRight = '5px';

      // Останавливаем всплытие событий, чтобы клик по чекбоксу не активировал ссылку
      checkboxElement.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      // Вставляем чекбокс перед содержимым ссылки
      chatLink.prepend(checkboxElement);
    });
  }

  /** Удаление выбранных чатов */
  async function deleteSelectedChats() {
    const selectedCheckboxes = document.querySelectorAll(
      '.gpt-chat-checkbox:checked'
    );
    if (!selectedCheckboxes.length) {
      return alert('❗ Оберіть чати для видалення');
    }

    if (!confirm(`Видалити ${selectedCheckboxes.length} чат(и)?`)) {
      return;
    }

    createOrUpdateStatusIndicator('⏳ Видалення...');
    let deletedCount = 0;

    for (const checkbox of selectedCheckboxes) {
      // Находим ссылку и извлекаем ID чата
      const chatLink = checkbox.closest('a[draggable="true"]');
      if (!chatLink) {
        console.warn('❌ Не найдена ссылка для чекбокса', checkbox);
        continue;
      }

      const hrefAttribute = chatLink.getAttribute('href') || '';
      const idMatch = hrefAttribute.match(/\/c\/([a-f0-9\-]+)/);
      if (!idMatch) {
        console.warn('❌ Не удалось извлечь ID из', hrefAttribute);
        continue;
      }

      const chatId = idMatch[1];

      // Используем захваченный токен
      const accessToken = capturedAccessToken;
      if (!accessToken) {
        console.error('❌ Токен ещё не перехвачен');
        alert(
          'Токен ещё не получен. Сначала откройте любое меню удаления вручную, чтобы расширение успело перехватить токен.'
        );
        return;
      }

      console.log('🗑 Удаляем чат (PATCH):', chatId);

      try {
        const response = await fetch(`/backend-api/conversation/${chatId}`, {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ is_visible: false }),
        });

        if (response.ok) {
          console.log(`✅ Чат удалён: ${chatId}`);
          deletedCount++;
        } else {
          console.warn(`⚠️ Ошибка ${response.status}`, await response.text());
        }
      } catch (error) {
        console.error('❌ Ошибка запроса для', chatId, error);
      }
    }

    createOrUpdateStatusIndicator(`✅ Видалено ${deletedCount} чат(и)!`);
    alert('✅ Видалення завершено!');
  }

  // Инициализация расширения
  console.log('🚀 Chrome расширение ChatGPT Bulk Chat Remover запущено');

  // Загружаем исключенные чаты из storage
  loadExcludedChatsFromStorage();

  injectFetchInterceptor();
  waitForNavigationSidebar();
})();
