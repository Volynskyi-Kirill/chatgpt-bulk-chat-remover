document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Default excluded chats
  const DEFAULT_EXCLUDED_CHATS = [];

  // DOM elements
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const newChatInput = document.getElementById('new-chat-input');
  const addChatButton = document.getElementById('add-chat-btn');
  const excludedList = document.getElementById('excluded-list');
  const resetButton = document.getElementById('reset-excluded-btn');

  // Initialization
  initializeTabs();
  loadExcludedChats();

  /** Initialize tabs */
  function initializeTabs() {
    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        switchToTab(targetTab);
      });
    });
  }

  /** Switch between tabs */
  function switchToTab(targetTabName) {
    // Remove active class from all buttons and content
    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    // Add active class to selected elements
    const activeButton = document.querySelector(
      `[data-tab="${targetTabName}"]`
    );
    const activeContent = document.getElementById(`${targetTabName}-tab`);

    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeContent.classList.add('active');
    }

    // If switched to excluded tab, update list
    if (targetTabName === 'excluded') {
      loadExcludedChats();
    }
  }

  /** Load excluded chats from storage */
  async function loadExcludedChats() {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const excludedChats = result.excludedChats || DEFAULT_EXCLUDED_CHATS;
      renderExcludedList(excludedChats);
    } catch (error) {
      console.error('Error loading excluded chats:', error);
      renderExcludedList(DEFAULT_EXCLUDED_CHATS);
    }
  }

  /** Save excluded chats to storage */
  async function saveExcludedChats(excludedChats) {
    try {
      await chrome.storage.sync.set({ excludedChats });
      console.log('Excluded chats saved:', excludedChats);

      // Notify content script about changes
      notifyContentScriptAboutChanges(excludedChats);
    } catch (error) {
      console.error('Error saving excluded chats:', error);
    }
  }

  /** Notify content script about changes */
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
      console.log('Content script not found or not active');
    }
  }

  /** Render excluded chats list */
  function renderExcludedList(excludedChats) {
    excludedList.innerHTML = '';

    if (!excludedChats || excludedChats.length === 0) {
      excludedList.innerHTML = '<div class="empty-state">No saved chats</div>';
      return;
    }

    excludedChats.forEach((chatTitle, index) => {
      const itemElement = createExcludedItem(chatTitle, index);
      excludedList.appendChild(itemElement);
    });
  }

  /** Create excluded chat item element */
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

    // Event handlers
    const editButton = itemDiv.querySelector('.edit-btn');
    const deleteButton = itemDiv.querySelector('.delete-btn');

    editButton.addEventListener('click', () => editExcludedChat(index));
    deleteButton.addEventListener('click', () => deleteExcludedChat(index));

    return itemDiv;
  }

  /** Escape HTML */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Add new excluded chat */
  async function addExcludedChat() {
    const newChatTitle = newChatInput.value.trim();

    if (!newChatTitle) {
      alert('Please enter chat name');
      return;
    }

    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const currentExcluded = result.excludedChats || DEFAULT_EXCLUDED_CHATS;

      // Check if chat already exists
      if (
        currentExcluded.some(
          (chat) => chat.toLowerCase() === newChatTitle.toLowerCase()
        )
      ) {
        alert('This chat is already in the saved list');
        return;
      }

      const updatedExcluded = [...currentExcluded, newChatTitle];
      await saveExcludedChats(updatedExcluded);

      newChatInput.value = '';
      renderExcludedList(updatedExcluded);
    } catch (error) {
      console.error('Error adding chat:', error);
      alert('Error adding chat');
    }
  }

  /** Edit excluded chat */
  async function editExcludedChat(index) {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const currentExcluded = result.excludedChats || DEFAULT_EXCLUDED_CHATS;

      const currentTitle = currentExcluded[index];
      const newTitle = prompt('Edit chat name:', currentTitle);

      if (newTitle === null) return; // Cancel

      const trimmedTitle = newTitle.trim();
      if (!trimmedTitle) {
        alert('Chat name cannot be empty');
        return;
      }

      // Check for duplicates (excluding current item)
      const otherChats = currentExcluded.filter((_, i) => i !== index);
      if (
        otherChats.some(
          (chat) => chat.toLowerCase() === trimmedTitle.toLowerCase()
        )
      ) {
        alert('This chat is already in the saved list');
        return;
      }

      const updatedExcluded = [...currentExcluded];
      updatedExcluded[index] = trimmedTitle;

      await saveExcludedChats(updatedExcluded);
      renderExcludedList(updatedExcluded);
    } catch (error) {
      console.error('Error editing chat:', error);
      alert('Error editing chat');
    }
  }

  /** Delete excluded chat */
  async function deleteExcludedChat(index) {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const currentExcluded = result.excludedChats || DEFAULT_EXCLUDED_CHATS;

      const chatTitle = currentExcluded[index];
      if (!confirm(`Remove "${chatTitle}" from saved chats?`)) {
        return;
      }

      const updatedExcluded = currentExcluded.filter((_, i) => i !== index);
      await saveExcludedChats(updatedExcluded);
      renderExcludedList(updatedExcluded);
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat');
    }
  }

  /** Reset to default excluded chats */
  async function resetToDefaultExcluded() {
    if (
      !confirm(
        'Reset saved chats list to default? All your changes will be lost.'
      )
    ) {
      return;
    }

    try {
      await saveExcludedChats(DEFAULT_EXCLUDED_CHATS);
      renderExcludedList(DEFAULT_EXCLUDED_CHATS);
    } catch (error) {
      console.error('Error resetting to default chats:', error);
      alert('Error resetting to default chats');
    }
  }

  // Event handlers
  addChatButton.addEventListener('click', addExcludedChat);
  resetButton.addEventListener('click', resetToDefaultExcluded);

  // Add chat on Enter key
  newChatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addExcludedChat();
    }
  });
});
