// Type definitions inline
interface ExtensionState {
  isUIAdded: boolean;
  capturedAccessToken: string | null;
  currentExcludedChats: string[];
  setUIAdded(value: boolean): void;
  setCapturedToken(token: string): void;
  updateExcludedChats(chats: string[]): void;
}

interface ChromeMessage {
  type: string;
  excludedChats: string[];
}

// Access global constants and components
const APP_CONSTANTS = (window as any).SHARED_CONSTANTS.CONTENT;
const CONTENT_DEFAULT_EXCLUDED_CHATS = (window as any).SHARED_CONSTANTS.SHARED
  .DEFAULT_EXCLUDED_CHATS;
const ContentStorageService = (window as any).StorageService;
const { ButtonFactory: ContentButtonFactory } = (window as any).UIComponents;
const {
  ChatLoader: ContentChatLoader,
  ChatSelector: ContentChatSelector,
  ChatDeleter: ContentChatDeleter,
} = (window as any).ChatOperations;

class ExtensionStateImpl implements ExtensionState {
  isUIAdded: boolean = false;
  capturedAccessToken: string | null = null;
  currentExcludedChats: string[] = CONTENT_DEFAULT_EXCLUDED_CHATS.map(
    (chat: string) => chat.toLowerCase()
  );

  setUIAdded(value: boolean): void {
    this.isUIAdded = value;
  }

  setCapturedToken(token: string): void {
    this.capturedAccessToken = token;
  }

  updateExcludedChats(chats: string[]): void {
    this.currentExcludedChats = chats.map((chat) => chat.toLowerCase());
  }
}

class MessageHandler {
  private state: ExtensionState;

  constructor(state: ExtensionState) {
    this.state = state;
    this.setupMessageListener();
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener(
      (
        message: ChromeMessage,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: any) => void
      ) => {
        if (message.type === 'EXCLUDED_CHATS_UPDATED') {
          this.state.updateExcludedChats(message.excludedChats);
          console.log(
            '🔄 Updated excluded chats:',
            this.state.currentExcludedChats
          );
          sendResponse({ success: true });
        }
        return true; // Keep message channel open for async response
      }
    );
  }
}

class TokenInterceptor {
  constructor(private state: ExtensionState) {
    this.injectScript();
    this.setupTokenListener();
  }

  private injectScript(): void {
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL('injected.js');
    scriptElement.onload = function () {
      (this as HTMLScriptElement).remove();
    };
    (document.head || document.documentElement).appendChild(scriptElement);
  }

  private setupTokenListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.source !== window) return;

      if (event.data.type && event.data.type === 'GPT_TOKEN_CAPTURED') {
        this.state.setCapturedToken(event.data.token);
        console.log('🗝️ Token successfully captured:');
      }
    });
  }
}

class UIBuilder {
  private state: ExtensionState;
  private chatSelector: any;
  private chatDeleter: any;

  constructor(state: ExtensionState) {
    this.state = state;
    this.chatSelector = new ContentChatSelector(state);
    this.chatDeleter = new ContentChatDeleter(state);
  }

  addUserInterface(containerElement: HTMLElement): void {
    const wrapperElement = this.createWrapper();
    const buttons = this.createButtons();

    buttons.forEach((button) => wrapperElement.appendChild(button));
    containerElement.prepend(wrapperElement);

    const statusElement = this.createStatusElement();
    containerElement.prepend(statusElement);
  }

  private createWrapper(): HTMLDivElement {
    const wrapperElement = document.createElement('div');
    Object.assign(wrapperElement.style, {
      padding: '10px',
      margin: '10px 0 10px 0',
      background: '#f2f2f2',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '14px',
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
    });
    return wrapperElement;
  }

  private createButtons(): HTMLButtonElement[] {
    return [
      ContentButtonFactory.createButton(
        '📜 Load All Chats',
        () => ContentChatLoader.loadAllChats(),
        APP_CONSTANTS.COLORS.BLUE
      ),
      ContentButtonFactory.createButton(
        '✅ Select All',
        () => this.chatSelector.selectAllChats(),
        APP_CONSTANTS.COLORS.GREEN
      ),
      ContentButtonFactory.createButton(
        '❌ Unselect All',
        () => this.chatSelector.unselectAllChats(),
        APP_CONSTANTS.COLORS.ORANGE
      ),
      ContentButtonFactory.createButton(
        '🗑 Delete Selected',
        () => this.chatDeleter.deleteSelectedChats(),
        APP_CONSTANTS.COLORS.RED
      ),
    ];
  }

  private createStatusElement(): HTMLDivElement {
    const statusElement = document.createElement('div');
    statusElement.id = 'gpt-bulk-status-indicator';
    Object.assign(statusElement.style, {
      marginTop: '6px',
      fontStyle: 'italic',
      color: '#169800',
      fontWeight: 'bold',
    });
    return statusElement;
  }
}

class NavigationWatcher {
  private state: ExtensionState;
  private uiBuilder: UIBuilder;

  constructor(state: ExtensionState) {
    this.state = state;
    this.uiBuilder = new UIBuilder(state);
  }

  startWatching(): void {
    const checkInterval = setInterval(() => {
      console.log('Looking for navigation panel...');
      const navigationBlock = document.querySelector(
        APP_CONSTANTS.SELECTORS.NAVIGATION_SIDEBAR
      ) as HTMLElement | null;

      if (navigationBlock) {
        console.log('Navigation panel found:', navigationBlock);
      } else {
        console.warn('Navigation panel not found');
      }

      if (navigationBlock && !this.state.isUIAdded) {
        this.state.setUIAdded(true);
        this.uiBuilder.addUserInterface(navigationBlock);
        clearInterval(checkInterval);
      }
    }, APP_CONSTANTS.TIMING.CHECK_INTERVAL);
  }
}

class ChatGPTBulkRemover {
  private state: ExtensionState;
  private messageHandler: MessageHandler;
  private tokenInterceptor: TokenInterceptor;
  private navigationWatcher: NavigationWatcher;

  constructor() {
    this.state = new ExtensionStateImpl();
    // These are initialized for side effects (event listeners, etc.)
    this.messageHandler = new MessageHandler(this.state);
    this.tokenInterceptor = new TokenInterceptor(this.state);
    this.navigationWatcher = new NavigationWatcher(this.state);
  }

  async initialize(): Promise<void> {
    console.log('ChatGPT Bulk Chat Remover Chrome extension started');

    const excludedChats = await ContentStorageService.loadExcludedChats();
    this.state.updateExcludedChats(excludedChats);
    console.log('Loaded excluded chats:', this.state.currentExcludedChats);

    this.navigationWatcher.startWatching();
  }
}

// Initialize Application
(function () {
  'use strict';

  const app = new ChatGPTBulkRemover();
  app.initialize();
})();
