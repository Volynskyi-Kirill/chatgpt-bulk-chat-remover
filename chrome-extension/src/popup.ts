// Type definitions inline
interface PopupSelectors {
  TAB_BUTTONS: string;
  TAB_CONTENTS: string;
  EXCLUDED_LIST: string;
  NEW_CHAT_INPUT: string;
  ADD_CHAT_BUTTON: string;
  RESET_BUTTON: string;
}

interface PopupTabs {
  MAIN: string;
  EXCLUDED: string;
}

interface PopupCSSClasses {
  ACTIVE: string;
  EXCLUDED_ITEM: string;
  EDIT_BUTTON: string;
  DELETE_BUTTON: string;
  EMPTY_STATE: string;
}

interface PopupMessages {
  ENTER_CHAT_NAME: string;
  CHAT_ALREADY_EXISTS: string;
  CHAT_NAME_EMPTY: string;
  ERROR_ADDING_CHAT: string;
  ERROR_EDITING_CHAT: string;
  ERROR_DELETING_CHAT: string;
  ERROR_RESETTING: string;
  CONFIRM_RESET: string;
  NO_SAVED_CHATS: string;
}

interface PopupConstants {
  SELECTORS: PopupSelectors;
  TABS: PopupTabs;
  CSS_CLASSES: PopupCSSClasses;
  MESSAGES: PopupMessages;
}

// Access global constants and components
const POPUP_CONSTANTS: PopupConstants = (window as any).SHARED_CONSTANTS.POPUP;
const POPUP_DEFAULT_EXCLUDED_CHATS = (window as any).SHARED_CONSTANTS.SHARED
  .DEFAULT_EXCLUDED_CHATS;
const PopupStorageService = (window as any).StorageService;

class ContentScriptMessenger {
  static async notifyContentScriptAboutChanges(
    excludedChats: string[]
  ): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab && tab.id && this.isChatGPTTab(tab.url)) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXCLUDED_CHATS_UPDATED',
          excludedChats: excludedChats,
        });
      }
    } catch (error) {
      console.log('Content script not found or not active');
    }
  }

  private static isChatGPTTab(url?: string): boolean {
    if (!url) return false;
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }
}

class TabManager {
  private tabButtons: NodeListOf<HTMLButtonElement>;
  private tabContents: NodeListOf<HTMLElement>;

  constructor() {
    this.tabButtons = document.querySelectorAll(
      POPUP_CONSTANTS.SELECTORS.TAB_BUTTONS
    ) as NodeListOf<HTMLButtonElement>;
    this.tabContents = document.querySelectorAll(
      POPUP_CONSTANTS.SELECTORS.TAB_CONTENTS
    ) as NodeListOf<HTMLElement>;
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        if (targetTab) {
          this.switchToTab(targetTab);
        }
      });
    });
  }

  private switchToTab(targetTabName: string): void {
    this.removeActiveClasses();
    this.activateTab(targetTabName);

    if (targetTabName === POPUP_CONSTANTS.TABS.EXCLUDED) {
      (window as any).excludedChatsManager?.loadAndRenderExcludedChats();
    }
  }

  private removeActiveClasses(): void {
    this.tabButtons.forEach((btn) =>
      btn.classList.remove(POPUP_CONSTANTS.CSS_CLASSES.ACTIVE)
    );
    this.tabContents.forEach((content) =>
      content.classList.remove(POPUP_CONSTANTS.CSS_CLASSES.ACTIVE)
    );
  }

  private activateTab(targetTabName: string): void {
    const activeButton = document.querySelector(
      `[data-tab="${targetTabName}"]`
    ) as HTMLButtonElement | null;
    const activeContent = document.getElementById(`${targetTabName}-tab`);

    if (activeButton && activeContent) {
      activeButton.classList.add(POPUP_CONSTANTS.CSS_CLASSES.ACTIVE);
      activeContent.classList.add(POPUP_CONSTANTS.CSS_CLASSES.ACTIVE);
    }
  }
}

class HTMLUtils {
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static createExcludedItemElement(
    chatTitle: string,
    index: number
  ): HTMLDivElement {
    const itemDiv = document.createElement('div');
    itemDiv.className = POPUP_CONSTANTS.CSS_CLASSES.EXCLUDED_ITEM;
    itemDiv.innerHTML = `
      <div class="excluded-item-text">${this.escapeHtml(chatTitle)}</div>
      <div class="excluded-item-actions">
        <button class="${
          POPUP_CONSTANTS.CSS_CLASSES.EDIT_BUTTON
        }" data-index="${index}">✏️</button>
        <button class="${
          POPUP_CONSTANTS.CSS_CLASSES.DELETE_BUTTON
        }" data-index="${index}">🗑️</button>
      </div>
    `;
    return itemDiv;
  }

  static createEmptyStateElement(): HTMLDivElement {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = POPUP_CONSTANTS.CSS_CLASSES.EMPTY_STATE;
    emptyDiv.textContent = POPUP_CONSTANTS.MESSAGES.NO_SAVED_CHATS;
    return emptyDiv;
  }
}

class ChatValidator {
  static validateNewChat(
    newChatTitle: string,
    existingChats: string[]
  ): boolean {
    if (!newChatTitle) {
      alert(POPUP_CONSTANTS.MESSAGES.ENTER_CHAT_NAME);
      return false;
    }

    if (this.chatAlreadyExists(newChatTitle, existingChats)) {
      alert(POPUP_CONSTANTS.MESSAGES.CHAT_ALREADY_EXISTS);
      return false;
    }

    return true;
  }

  static validateEditedChat(
    newTitle: string,
    existingChats: string[],
    currentIndex: number
  ): boolean {
    if (!newTitle.trim()) {
      alert(POPUP_CONSTANTS.MESSAGES.CHAT_NAME_EMPTY);
      return false;
    }

    const otherChats = existingChats.filter((_, i) => i !== currentIndex);
    if (this.chatAlreadyExists(newTitle.trim(), otherChats)) {
      alert(POPUP_CONSTANTS.MESSAGES.CHAT_ALREADY_EXISTS);
      return false;
    }

    return true;
  }

  private static chatAlreadyExists(
    chatTitle: string,
    existingChats: string[]
  ): boolean {
    return existingChats.some(
      (chat) => chat.toLowerCase() === chatTitle.toLowerCase()
    );
  }
}

class ExcludedChatsManager {
  private excludedList: HTMLElement;
  private newChatInput: HTMLInputElement;
  private addChatButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;

  constructor() {
    this.excludedList = document.getElementById(
      POPUP_CONSTANTS.SELECTORS.EXCLUDED_LIST.slice(1)
    ) as HTMLElement;
    this.newChatInput = document.getElementById(
      POPUP_CONSTANTS.SELECTORS.NEW_CHAT_INPUT.slice(1)
    ) as HTMLInputElement;
    this.addChatButton = document.getElementById(
      POPUP_CONSTANTS.SELECTORS.ADD_CHAT_BUTTON.slice(1)
    ) as HTMLButtonElement;
    this.resetButton = document.getElementById(
      POPUP_CONSTANTS.SELECTORS.RESET_BUTTON.slice(1)
    ) as HTMLButtonElement;

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.addChatButton.addEventListener('click', () => this.addExcludedChat());
    this.resetButton.addEventListener('click', () =>
      this.resetToDefaultExcluded()
    );

    this.newChatInput.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.addExcludedChat();
      }
    });
  }

  async loadAndRenderExcludedChats(): Promise<void> {
    const excludedChats = await PopupStorageService.loadExcludedChats();
    this.renderExcludedList(excludedChats);
  }

  private renderExcludedList(excludedChats: string[]): void {
    this.excludedList.innerHTML = '';

    if (!excludedChats || excludedChats.length === 0) {
      this.excludedList.appendChild(HTMLUtils.createEmptyStateElement());
      return;
    }

    excludedChats.forEach((chatTitle, index) => {
      const itemElement = this.createExcludedItemWithEvents(chatTitle, index);
      this.excludedList.appendChild(itemElement);
    });
  }

  private createExcludedItemWithEvents(
    chatTitle: string,
    index: number
  ): HTMLDivElement {
    const itemElement = HTMLUtils.createExcludedItemElement(chatTitle, index);

    const editButton = itemElement.querySelector(
      `.${POPUP_CONSTANTS.CSS_CLASSES.EDIT_BUTTON}`
    ) as HTMLButtonElement;
    const deleteButton = itemElement.querySelector(
      `.${POPUP_CONSTANTS.CSS_CLASSES.DELETE_BUTTON}`
    ) as HTMLButtonElement;

    editButton.addEventListener('click', () => this.editExcludedChat(index));
    deleteButton.addEventListener('click', () =>
      this.deleteExcludedChat(index)
    );

    return itemElement;
  }

  private async addExcludedChat(): Promise<void> {
    const newChatTitle = this.newChatInput.value.trim();
    const currentExcluded = await PopupStorageService.loadExcludedChats();

    if (!ChatValidator.validateNewChat(newChatTitle, currentExcluded)) {
      return;
    }

    try {
      const updatedExcluded = [...currentExcluded, newChatTitle];
      const success = await this.saveAndNotify(updatedExcluded);

      if (success) {
        this.newChatInput.value = '';
        this.renderExcludedList(updatedExcluded);
      }
    } catch (error) {
      console.error('Error adding chat:', error);
      alert(POPUP_CONSTANTS.MESSAGES.ERROR_ADDING_CHAT);
    }
  }

  private async editExcludedChat(index: number): Promise<void> {
    try {
      const currentExcluded = await PopupStorageService.loadExcludedChats();
      const currentTitle = currentExcluded[index];
      const newTitle = prompt('Edit chat name:', currentTitle);

      if (newTitle === null) return;

      if (!ChatValidator.validateEditedChat(newTitle, currentExcluded, index)) {
        return;
      }

      const updatedExcluded = [...currentExcluded];
      updatedExcluded[index] = newTitle.trim();

      const success = await this.saveAndNotify(updatedExcluded);
      if (success) {
        this.renderExcludedList(updatedExcluded);
      }
    } catch (error) {
      console.error('Error editing chat:', error);
      alert(POPUP_CONSTANTS.MESSAGES.ERROR_EDITING_CHAT);
    }
  }

  private async deleteExcludedChat(index: number): Promise<void> {
    try {
      const currentExcluded = await PopupStorageService.loadExcludedChats();
      const chatTitle = currentExcluded[index];

      if (!confirm(`Remove "${chatTitle}" from saved chats?`)) {
        return;
      }

      const updatedExcluded = currentExcluded.filter(
        (_: string, i: number) => i !== index
      );
      const success = await this.saveAndNotify(updatedExcluded);

      if (success) {
        this.renderExcludedList(updatedExcluded);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert(POPUP_CONSTANTS.MESSAGES.ERROR_DELETING_CHAT);
    }
  }

  private async resetToDefaultExcluded(): Promise<void> {
    if (!confirm(POPUP_CONSTANTS.MESSAGES.CONFIRM_RESET)) {
      return;
    }

    try {
      const success = await this.saveAndNotify(POPUP_DEFAULT_EXCLUDED_CHATS);
      if (success) {
        this.renderExcludedList(POPUP_DEFAULT_EXCLUDED_CHATS);
      }
    } catch (error) {
      console.error('Error resetting to default chats:', error);
      alert(POPUP_CONSTANTS.MESSAGES.ERROR_RESETTING);
    }
  }

  private async saveAndNotify(excludedChats: string[]): Promise<boolean> {
    const success = await PopupStorageService.saveExcludedChats(excludedChats);
    if (success) {
      await ContentScriptMessenger.notifyContentScriptAboutChanges(
        excludedChats
      );
    }
    return success;
  }
}

class PopupApplication {
  private tabManager: TabManager;
  private excludedChatsManager: ExcludedChatsManager;

  constructor() {
    // Initialize for side effects (event listeners)
    this.tabManager = new TabManager();
    this.excludedChatsManager = new ExcludedChatsManager();

    // Make excludedChatsManager globally accessible for tab switching
    (window as any).excludedChatsManager = this.excludedChatsManager;
  }

  async initialize(): Promise<void> {
    await this.excludedChatsManager.loadAndRenderExcludedChats();
  }
}

// Global type extension removed for compatibility

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const app = new PopupApplication();
  app.initialize();
});
