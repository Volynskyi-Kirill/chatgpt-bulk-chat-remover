(function () {
  'use strict';

  // Default excluded chats
  const DEFAULT_EXCLUDED_CHATS = [];

  // Current list of excluded chats (will be loaded from storage)
  let currentExcludedChats = DEFAULT_EXCLUDED_CHATS.map((chat) =>
    chat.toLowerCase()
  );

  // Global variables
  let isUIAdded = false;
  let capturedAccessToken = null;

  /** Utility function for waiting */
  function waitForTime(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /** Load excluded chats from chrome.storage */
  async function loadExcludedChatsFromStorage() {
    try {
      const result = await chrome.storage.sync.get(['excludedChats']);
      const excludedChats = result.excludedChats || DEFAULT_EXCLUDED_CHATS;
      currentExcludedChats = excludedChats.map((chat) => chat.toLowerCase());
      console.log('🔄 Loaded excluded chats:', currentExcludedChats);
    } catch (error) {
      console.error('❌ Error loading excluded chats:', error);
      currentExcludedChats = DEFAULT_EXCLUDED_CHATS.map((chat) =>
        chat.toLowerCase()
      );
    }
  }

  /** Handle messages from popup */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXCLUDED_CHATS_UPDATED') {
      currentExcludedChats = message.excludedChats.map((chat) =>
        chat.toLowerCase()
      );
      console.log('🔄 Updated excluded chats:', currentExcludedChats);
      sendResponse({ success: true });
    }
  });

  /** Create or update status indicator */
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

  /** Inject script for fetch interception */
  function injectFetchInterceptor() {
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL('injected.js');
    scriptElement.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(scriptElement);

    // Listen for messages from injected script
    window.addEventListener('message', function (event) {
      if (event.source !== window) return;

      if (event.data.type && event.data.type === 'GPT_TOKEN_CAPTURED') {
        capturedAccessToken = event.data.token;
        console.log('🗝️ Token successfully captured:', capturedAccessToken);
      }
    });
  }

  /** Wait for navigation sidebar to appear */
  function waitForNavigationSidebar() {
    const checkInterval = setInterval(() => {
      console.log('🔍 Looking for navigation panel...');
      const navigationBlock = document.querySelector(
        'nav.group\\/scrollport, nav.group\\/scrollport.relative'
      );

      if (navigationBlock) {
        console.log('✅ Navigation panel found:', navigationBlock);
      } else {
        console.warn('❌ Navigation panel not found');
      }

      if (navigationBlock && !isUIAdded) {
        isUIAdded = true;
        addUserInterface(navigationBlock);
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  /** Apply styles to button */
  function applyButtonStyles(
    button,
    backgroundColor = '#4CAF50',
    hoverColor = '#45a049'
  ) {
    button.style.padding = '8px 12px';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = backgroundColor;
    button.style.color = 'white';
    button.style.fontSize = '12px';
    button.style.fontWeight = '500';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s ease';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    button.style.userSelect = 'none';

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = hoverColor;
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = backgroundColor;
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    // Click effect
    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(1px)';
      button.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    });
  }

  /** Add user interface */
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
    wrapperElement.style.flexWrap = 'wrap';

    const scrollButton = document.createElement('button');
    scrollButton.textContent = '📜 Load All Chats';
    scrollButton.onclick = scrollToBottomAndLoadChats;
    applyButtonStyles(scrollButton, '#2196F3', '#1976D2'); // Blue

    const selectButton = document.createElement('button');
    selectButton.textContent = '✅ Select All';
    selectButton.onclick = () => {
      document.querySelectorAll('.gpt-chat-checkbox').forEach((checkbox) => {
        const chatLink = checkbox.closest('a[draggable="true"]');
        // Find element with chat title
        const titleElement = chatLink.querySelector('.truncate');
        const chatTitle = titleElement?.textContent.trim().toLowerCase() || '';

        checkbox.checked = !currentExcludedChats.includes(chatTitle);
      });
    };
    applyButtonStyles(selectButton, '#4CAF50', '#45a049'); // Green

    const unselectButton = document.createElement('button');
    unselectButton.textContent = '❌ Unselect All';
    unselectButton.onclick = () => {
      document.querySelectorAll('.gpt-chat-checkbox').forEach((checkbox) => {
        checkbox.checked = false;
      });
    };
    applyButtonStyles(unselectButton, '#FF9800', '#F57C00'); // Orange

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑 Delete Selected';
    deleteButton.onclick = deleteSelectedChats;
    applyButtonStyles(deleteButton, '#f44336', '#d32f2f'); // Red

    wrapperElement.appendChild(scrollButton);
    wrapperElement.appendChild(selectButton);
    wrapperElement.appendChild(unselectButton);
    wrapperElement.appendChild(deleteButton);

    containerElement.prepend(wrapperElement);

    // Add status element below menu
    const statusElement = document.createElement('div');
    statusElement.id = 'gpt-bulk-status-indicator';
    statusElement.style.marginTop = '6px';
    statusElement.style.fontStyle = 'italic';
    statusElement.style.color = '#169800';
    statusElement.style.fontWeight = 'bold';
    containerElement.prepend(statusElement);
  }

  /** Scroll to bottom of chat list to load all chats */
  async function scrollToBottomAndLoadChats() {
    const scrollableElement = document.querySelector(
      'nav.group\\/scrollport, nav.group\\/scrollport.relative'
    );
    if (!scrollableElement) return;

    const statusElement = createOrUpdateStatusIndicator('⏳ Loading...');
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
    statusElement.textContent = '✅ All chats loaded!';
  }

  /** Add checkboxes to chats */
  function addCheckboxesToChats() {
    const chatLinkElements = document.querySelectorAll(
      'aside[aria-labelledby] a[draggable="true"]'
    );

    chatLinkElements.forEach((chatLink) => {
      // Skip if checkbox already added
      if (chatLink.querySelector('.gpt-chat-checkbox')) return;

      // Create checkbox
      const checkboxElement = document.createElement('input');
      checkboxElement.type = 'checkbox';
      checkboxElement.className = 'gpt-chat-checkbox';
      checkboxElement.style.marginRight = '5px';

      // Stop event bubbling so checkbox click doesn't activate link
      checkboxElement.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      // Insert checkbox before link content
      chatLink.prepend(checkboxElement);
    });
  }

  /** Delete selected chats */
  async function deleteSelectedChats() {
    const selectedCheckboxes = document.querySelectorAll(
      '.gpt-chat-checkbox:checked'
    );
    if (!selectedCheckboxes.length) {
      return alert('❗ Please select chats to delete');
    }

    if (!confirm(`Delete ${selectedCheckboxes.length} chat(s)?`)) {
      return;
    }

    createOrUpdateStatusIndicator('⏳ Deleting...');
    let deletedCount = 0;

    for (const checkbox of selectedCheckboxes) {
      // Find link and extract chat ID
      const chatLink = checkbox.closest('a[draggable="true"]');
      if (!chatLink) {
        console.warn('❌ Link not found for checkbox', checkbox);
        continue;
      }

      const hrefAttribute = chatLink.getAttribute('href') || '';
      const idMatch = hrefAttribute.match(/\/c\/([a-f0-9\-]+)/);
      if (!idMatch) {
        console.warn('❌ Failed to extract ID from', hrefAttribute);
        continue;
      }

      const chatId = idMatch[1];

      // Use captured token
      const accessToken = capturedAccessToken;
      if (!accessToken) {
        console.error('❌ Token not captured yet');
        alert(
          'Token not received yet. Please manually open any delete menu first so the extension can capture the token.'
        );
        return;
      }

      console.log('🗑 Deleting chat (PATCH):', chatId);

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
          console.log(`✅ Chat deleted: ${chatId}`);
          deletedCount++;
        } else {
          console.warn(`⚠️ Error ${response.status}`, await response.text());
        }
      } catch (error) {
        console.error('❌ Request error for', chatId, error);
      }
    }

    createOrUpdateStatusIndicator(`✅ Deleted ${deletedCount} chat(s)!`);
    alert('✅ Deletion completed!');
  }

  // Extension initialization
  console.log('🚀 ChatGPT Bulk Chat Remover Chrome extension started');

  // Load excluded chats from storage
  loadExcludedChatsFromStorage();

  injectFetchInterceptor();
  waitForNavigationSidebar();
})();
