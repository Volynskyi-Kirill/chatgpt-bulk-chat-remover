// Type definitions inline
interface StorageData {
  excludedChats?: string[];
}

// Access global constants
const DEFAULT_EXCLUDED_CHATS = (window as any).SHARED_CONSTANTS.SHARED
  .DEFAULT_EXCLUDED_CHATS;

class StorageService {
  static async loadExcludedChats(): Promise<string[]> {
    try {
      const result: StorageData = await chrome.storage.sync.get([
        'excludedChats',
      ]);
      return result.excludedChats || DEFAULT_EXCLUDED_CHATS;
    } catch (error) {
      console.error('Error loading excluded chats:', error);
      return DEFAULT_EXCLUDED_CHATS;
    }
  }

  static async saveExcludedChats(excludedChats: string[]): Promise<boolean> {
    try {
      await chrome.storage.sync.set({ excludedChats });
      console.log('Excluded chats saved:', excludedChats);
      return true;
    } catch (error) {
      console.error('Error saving excluded chats:', error);
      return false;
    }
  }
}

// IIFE wrapper for compatibility with existing code
(function () {
  'use strict';
  (window as any).StorageService = StorageService;
})();
