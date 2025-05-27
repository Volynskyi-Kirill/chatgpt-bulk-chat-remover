// Type definitions inline
interface ColorScheme {
  primary: string;
  hover: string;
}

interface AppSelectors {
  NAVIGATION_SIDEBAR: string;
  CHAT_LINKS: string;
  CHAT_CHECKBOXES: string;
  STATUS_INDICATOR: string;
}

interface ContentConstants {
  SELECTORS: AppSelectors;
  COLORS: {
    BLUE: ColorScheme;
    GREEN: ColorScheme;
    ORANGE: ColorScheme;
    RED: ColorScheme;
  };
  TIMING: {
    CHECK_INTERVAL: number;
    SCROLL_DELAY: number;
    MAX_SCROLL_ITERATIONS: number;
    MAX_UNCHANGED_HEIGHT: number;
    DELETION_CONCURRENCY_LIMIT: number;
  };
  MESSAGES: {
    NO_CHATS_SELECTED: string;
    TOKEN_NOT_CAPTURED: string;
    DELETION_COMPLETED: string;
  };
  API: {
    CONVERSATION_ENDPOINT: string;
  };
}

// Access global constants
const CONSTANTS: ContentConstants = (window as any).SHARED_CONSTANTS.CONTENT;

class StatusManager {
  static createOrUpdateIndicator(statusText: string): HTMLElement {
    let statusElement = document.querySelector(
      CONSTANTS.SELECTORS.STATUS_INDICATOR
    ) as HTMLElement | null;

    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'gpt-bulk-status-indicator';
      Object.assign(statusElement.style, {
        marginTop: '6px',
        fontStyle: 'italic',
        color: '#169800',
        fontWeight: 'bold',
      });
      document.body.prepend(statusElement);
    }
    statusElement.textContent = statusText;
    return statusElement;
  }
}

class ButtonFactory {
  static createButton(
    text: string,
    onClick: () => void,
    colorScheme: ColorScheme
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    this.applyButtonStyles(button, colorScheme.primary, colorScheme.hover);
    return button;
  }

  static applyButtonStyles(
    button: HTMLButtonElement,
    backgroundColor: string,
    hoverColor: string
  ): void {
    Object.assign(button.style, {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: backgroundColor,
      color: 'white',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      userSelect: 'none',
    });

    this.addHoverEffects(button, backgroundColor, hoverColor);
    this.addClickEffects(button);
  }

  static addHoverEffects(
    button: HTMLButtonElement,
    backgroundColor: string,
    hoverColor: string
  ): void {
    button.addEventListener('mouseenter', () => {
      Object.assign(button.style, {
        backgroundColor: hoverColor,
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      });
    });

    button.addEventListener('mouseleave', () => {
      Object.assign(button.style, {
        backgroundColor: backgroundColor,
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      });
    });
  }

  static addClickEffects(button: HTMLButtonElement): void {
    button.addEventListener('mousedown', () => {
      Object.assign(button.style, {
        transform: 'translateY(1px)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      });
    });

    button.addEventListener('mouseup', () => {
      Object.assign(button.style, {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      });
    });
  }
}

class CheckboxManager {
  static addCheckboxesToChats(): void {
    const chatLinkElements = document.querySelectorAll(
      CONSTANTS.SELECTORS.CHAT_LINKS
    ) as NodeListOf<HTMLAnchorElement>;

    chatLinkElements.forEach((chatLink) => {
      if (chatLink.querySelector(CONSTANTS.SELECTORS.CHAT_CHECKBOXES)) return;

      const checkboxElement = document.createElement('input');
      checkboxElement.type = 'checkbox';
      checkboxElement.className = 'gpt-chat-checkbox';
      checkboxElement.style.marginRight = '5px';

      checkboxElement.addEventListener('click', (event: Event) => {
        event.stopPropagation();
      });

      chatLink.prepend(checkboxElement);
    });
  }
}

// IIFE wrapper for compatibility with existing code
(function () {
  'use strict';

  const UIComponents = {
    StatusManager,
    ButtonFactory,
    CheckboxManager,
  };

  (window as any).UIComponents = UIComponents;
})();
