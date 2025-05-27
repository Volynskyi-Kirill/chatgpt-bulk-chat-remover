export interface ColorScheme {
  primary: string;
  hover: string;
}
export interface AppColors {
  BLUE: ColorScheme;
  GREEN: ColorScheme;
  ORANGE: ColorScheme;
  RED: ColorScheme;
}
export interface AppSelectors {
  NAVIGATION_SIDEBAR: string;
  CHAT_LINKS: string;
  CHAT_CHECKBOXES: string;
  STATUS_INDICATOR: string;
}
export interface AppTiming {
  CHECK_INTERVAL: number;
  SCROLL_DELAY: number;
  MAX_SCROLL_ITERATIONS: number;
  MAX_UNCHANGED_HEIGHT: number;
  DELETION_CONCURRENCY_LIMIT: number;
}
export interface AppMessages {
  NO_CHATS_SELECTED: string;
  TOKEN_NOT_CAPTURED: string;
  DELETION_COMPLETED: string;
}
export interface AppAPI {
  CONVERSATION_ENDPOINT: string;
}
export interface ContentConstants {
  SELECTORS: AppSelectors;
  COLORS: AppColors;
  TIMING: AppTiming;
  MESSAGES: AppMessages;
  API: AppAPI;
}
export interface PopupSelectors {
  TAB_BUTTONS: string;
  TAB_CONTENTS: string;
  EXCLUDED_LIST: string;
  NEW_CHAT_INPUT: string;
  ADD_CHAT_BUTTON: string;
  RESET_BUTTON: string;
}
export interface PopupTabs {
  MAIN: string;
  EXCLUDED: string;
}
export interface PopupCSSClasses {
  ACTIVE: string;
  EXCLUDED_ITEM: string;
  EDIT_BUTTON: string;
  DELETE_BUTTON: string;
  EMPTY_STATE: string;
}
export interface PopupMessages {
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
export interface PopupConstants {
  SELECTORS: PopupSelectors;
  TABS: PopupTabs;
  CSS_CLASSES: PopupCSSClasses;
  MESSAGES: PopupMessages;
}
export interface SharedConstants {
  DEFAULT_EXCLUDED_CHATS: string[];
}
export interface AppConstants {
  CONTENT: ContentConstants;
  POPUP: PopupConstants;
  SHARED: SharedConstants;
}
export interface ExtensionState {
  isUIAdded: boolean;
  capturedAccessToken: string | null;
  currentExcludedChats: string[];
}
export interface ExcludedChatsUpdateMessage {
  type: 'EXCLUDED_CHATS_UPDATED';
  excludedChats: string[];
}
export interface TokenCaptureMessage {
  type: 'GPT_TOKEN_CAPTURED';
  token: string;
}
export type ChromeMessage = ExcludedChatsUpdateMessage | TokenCaptureMessage;
export interface StorageData {
  excludedChats?: string[];
}
export interface ChatDeletionResponse {
  is_visible: boolean;
}
declare global {
  interface Window {
    SHARED_CONSTANTS: AppConstants;
    StorageService: typeof import('../src/modules/storage-service').StorageService;
    UIComponents: typeof import('../src/modules/ui-components');
    ChatOperations: typeof import('../src/modules/chat-operations');
  }
}
//# sourceMappingURL=app-types.d.ts.map
