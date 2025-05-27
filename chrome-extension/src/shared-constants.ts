// Type definitions inline to avoid imports
interface ColorScheme {
  primary: string;
  hover: string;
}

interface AppColors {
  BLUE: ColorScheme;
  GREEN: ColorScheme;
  ORANGE: ColorScheme;
  RED: ColorScheme;
}

interface AppSelectors {
  NAVIGATION_SIDEBAR: string;
  CHAT_LINKS: string;
  CHAT_CHECKBOXES: string;
  STATUS_INDICATOR: string;
}

interface AppTiming {
  CHECK_INTERVAL: number;
  SCROLL_DELAY: number;
  MAX_SCROLL_ITERATIONS: number;
  MAX_UNCHANGED_HEIGHT: number;
  DELETION_CONCURRENCY_LIMIT: number;
}

interface AppMessages {
  NO_CHATS_SELECTED: string;
  TOKEN_NOT_CAPTURED: string;
  DELETION_COMPLETED: string;
}

interface AppAPI {
  CONVERSATION_ENDPOINT: string;
}

interface ContentConstants {
  SELECTORS: AppSelectors;
  COLORS: AppColors;
  TIMING: AppTiming;
  MESSAGES: AppMessages;
  API: AppAPI;
}

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

interface SharedConstants {
  DEFAULT_EXCLUDED_CHATS: string[];
}

interface AppConstants {
  CONTENT: ContentConstants;
  POPUP: PopupConstants;
  SHARED: SharedConstants;
}

const SHARED_CONSTANTS: AppConstants = {
  CONTENT: {
    SELECTORS: {
      NAVIGATION_SIDEBAR: 'nav[aria-label="Chat history"]',
      CHAT_LINKS: 'nav[aria-label="Chat history"] a[draggable]',
      CHAT_CHECKBOXES: '.gpt-chat-checkbox',
      STATUS_INDICATOR: '#gpt-bulk-status-indicator',
    },
    COLORS: {
      BLUE: { primary: '#007bff', hover: '#0056b3' },
      GREEN: { primary: '#28a745', hover: '#1e7e34' },
      ORANGE: { primary: '#fd7e14', hover: '#e55a00' },
      RED: { primary: '#dc3545', hover: '#c82333' },
    },
    TIMING: {
      CHECK_INTERVAL: 1000,
      SCROLL_DELAY: 500,
      MAX_SCROLL_ITERATIONS: 70,
      MAX_UNCHANGED_HEIGHT: 3,
      DELETION_CONCURRENCY_LIMIT: 4,
    },
    MESSAGES: {
      NO_CHATS_SELECTED: 'No chats selected for deletion.',
      TOKEN_NOT_CAPTURED:
        'Authorization token not captured. Please send any message to chat and try again.',
      DELETION_COMPLETED: 'Chat deletion completed!',
    },
    API: {
      CONVERSATION_ENDPOINT: 'https://chatgpt.com/backend-api/conversation',
    },
  },
  POPUP: {
    SELECTORS: {
      TAB_BUTTONS: '.tab-button',
      TAB_CONTENTS: '.tab-content',
      EXCLUDED_LIST: '#excluded-list',
      NEW_CHAT_INPUT: '#new-chat-input',
      ADD_CHAT_BUTTON: '#add-chat-btn',
      RESET_BUTTON: '#reset-excluded-btn',
    },
    TABS: {
      MAIN: 'main',
      EXCLUDED: 'excluded',
    },
    CSS_CLASSES: {
      ACTIVE: 'active',
      EXCLUDED_ITEM: 'excluded-item',
      EDIT_BUTTON: 'edit-btn',
      DELETE_BUTTON: 'delete-btn',
      EMPTY_STATE: 'empty-state',
    },
    MESSAGES: {
      ENTER_CHAT_NAME: 'Please enter a chat name.',
      CHAT_ALREADY_EXISTS: 'This chat is already in the saved list.',
      CHAT_NAME_EMPTY: 'Chat name cannot be empty.',
      ERROR_ADDING_CHAT: 'Error adding chat. Please try again.',
      ERROR_EDITING_CHAT: 'Error editing chat. Please try again.',
      ERROR_DELETING_CHAT: 'Error deleting chat. Please try again.',
      ERROR_RESETTING: 'Error resetting to default chats. Please try again.',
      CONFIRM_RESET:
        'Reset to default saved chats? This will remove all your custom saved chats.',
      NO_SAVED_CHATS:
        'No saved chats. Add some chats to protect them from deletion.',
    },
  },
  SHARED: {
    DEFAULT_EXCLUDED_CHATS: [],
  },
};

// Attach to window for global access
(window as any).SHARED_CONSTANTS = SHARED_CONSTANTS;
