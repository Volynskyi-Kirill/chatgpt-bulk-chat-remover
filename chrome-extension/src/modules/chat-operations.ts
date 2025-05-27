// Type definitions inline
interface ExtensionState {
  isUIAdded: boolean;
  capturedAccessToken: string | null;
  currentExcludedChats: string[];
}

interface ChatDeletionResponse {
  is_visible: boolean;
}

// Access global constants and components
const CHAT_CONSTANTS = (window as any).SHARED_CONSTANTS.CONTENT;
const {
  StatusManager: ChatStatusManager,
  CheckboxManager: ChatCheckboxManager,
} = (window as any).UIComponents;

class ChatLoader {
  static async loadAllChats(): Promise<void> {
    const scrollableElement = document.querySelector(
      CHAT_CONSTANTS.SELECTORS.NAVIGATION_SIDEBAR
    ) as HTMLElement | null;

    if (!scrollableElement) return;

    const statusElement =
      ChatStatusManager.createOrUpdateIndicator('⏳ Loading...');
    let previousHeight = 0;
    let unchangedHeightCount = 0;

    for (
      let iteration = 0;
      iteration < CHAT_CONSTANTS.TIMING.MAX_SCROLL_ITERATIONS &&
      unchangedHeightCount < CHAT_CONSTANTS.TIMING.MAX_UNCHANGED_HEIGHT;
      iteration++
    ) {
      scrollableElement.scrollTo({
        top: scrollableElement.scrollHeight,
        behavior: 'smooth',
      });
      await ChatLoader.waitForTime(CHAT_CONSTANTS.TIMING.SCROLL_DELAY);

      const currentHeight = scrollableElement.scrollHeight;
      if (currentHeight === previousHeight) {
        unchangedHeightCount++;
      } else {
        unchangedHeightCount = 0;
      }

      previousHeight = currentHeight;
    }

    ChatCheckboxManager.addCheckboxesToChats();
    statusElement.textContent = '✅ All chats loaded!';
  }

  static waitForTime(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

class ChatSelector {
  private state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
  }

  selectAllChats(): void {
    const checkboxes = document.querySelectorAll(
      CHAT_CONSTANTS.SELECTORS.CHAT_CHECKBOXES
    ) as NodeListOf<HTMLInputElement>;

    checkboxes.forEach((checkbox) => {
      const chatLink = checkbox.closest(
        'a[draggable="true"]'
      ) as HTMLAnchorElement | null;
      const titleElement = chatLink?.querySelector(
        '.truncate'
      ) as HTMLElement | null;
      const chatTitle = titleElement?.textContent?.trim().toLowerCase() || '';

      checkbox.checked = !this.state.currentExcludedChats.includes(chatTitle);
    });
  }

  unselectAllChats(): void {
    const checkboxes = document.querySelectorAll(
      CHAT_CONSTANTS.SELECTORS.CHAT_CHECKBOXES
    ) as NodeListOf<HTMLInputElement>;

    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
}

class ChatDeleter {
  private state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
  }

  async deleteSelectedChats(): Promise<void> {
    const selectedCheckboxes = document.querySelectorAll(
      `${CHAT_CONSTANTS.SELECTORS.CHAT_CHECKBOXES}:checked`
    ) as NodeListOf<HTMLInputElement>;

    if (!selectedCheckboxes.length) {
      alert(CHAT_CONSTANTS.MESSAGES.NO_CHATS_SELECTED);
      return;
    }

    if (!confirm(`Delete ${selectedCheckboxes.length} chat(s)?`)) {
      return;
    }

    if (!this.state.capturedAccessToken) {
      console.error('Token not captured yet');
      alert(CHAT_CONSTANTS.MESSAGES.TOKEN_NOT_CAPTURED);
      return;
    }

    ChatStatusManager.createOrUpdateIndicator('⏳ Deleting...');
    let deletedCount = 0;
    const concurrencyLimit = CHAT_CONSTANTS.TIMING.DELETION_CONCURRENCY_LIMIT;
    const checkboxesArray = Array.from(selectedCheckboxes);

    // Process chats in batches with limited concurrency
    for (
      let batchIndex = 0;
      batchIndex < checkboxesArray.length;
      batchIndex += concurrencyLimit
    ) {
      const currentBatch = checkboxesArray.slice(
        batchIndex,
        batchIndex + concurrencyLimit
      );

      const batchResults = await Promise.all(
        currentBatch.map(async (checkbox) => {
          const chatId = this.extractChatId(checkbox);
          if (!chatId) return false;
          return await this.deleteSingleChat(chatId);
        })
      );

      deletedCount += batchResults.filter(Boolean).length;

      // Update progress indicator
      ChatStatusManager.createOrUpdateIndicator(
        `⏳ Deleted ${deletedCount} of ${checkboxesArray.length} chat(s)...`
      );
    }

    ChatStatusManager.createOrUpdateIndicator(
      `✅ Deleted ${deletedCount} chat(s)!`
    );
    alert(CHAT_CONSTANTS.MESSAGES.DELETION_COMPLETED);
  }

  private extractChatId(checkbox: HTMLInputElement): string | null {
    const chatLink = checkbox.closest(
      'a[draggable="true"]'
    ) as HTMLAnchorElement | null;
    if (!chatLink) {
      console.warn('Link not found for checkbox', checkbox);
      return null;
    }

    const hrefAttribute = chatLink.getAttribute('href') || '';
    const idMatch = hrefAttribute.match(/\/c\/([a-f0-9\-]+)/);
    if (!idMatch) {
      console.warn('Failed to extract ID from', hrefAttribute);
      return null;
    }

    return idMatch[1] || null;
  }

  private async deleteSingleChat(chatId: string): Promise<boolean> {
    console.log('Deleting chat (PATCH):', chatId);

    try {
      const response = await fetch(
        `${CHAT_CONSTANTS.API.CONVERSATION_ENDPOINT}/${chatId}`,
        {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.state.capturedAccessToken}`,
          },
          body: JSON.stringify({ is_visible: false } as ChatDeletionResponse),
        }
      );

      if (response.ok) {
        console.log(`Chat deleted: ${chatId}`);
        return true;
      } else {
        console.warn(`Error ${response.status}`, await response.text());
        return false;
      }
    } catch (error) {
      console.error('Request error for', chatId, error);
      return false;
    }
  }
}

// IIFE wrapper for compatibility with existing code
(function () {
  'use strict';

  const ChatOperations = {
    ChatLoader,
    ChatSelector,
    ChatDeleter,
  };

  (window as any).ChatOperations = ChatOperations;
})();
