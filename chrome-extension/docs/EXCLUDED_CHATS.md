# 🛡️ Managing Saved Chats

## Feature Description

This new feature allows you to manage a list of chats that **WILL NOT be deleted** during bulk deletion. These chats are called "saved" or "excluded" chats.

## How to Use

### 1. Opening the Management Interface

1. Click on the extension icon in your browser
2. Go to the **"Saved Chats"** tab

### 2. Adding a New Saved Chat

1. Enter the chat name in the input field
2. Click the **"➕ Add"** button or press Enter
3. The chat will be added to the saved list

### 3. Editing Chat Name

1. Find the desired chat in the list
2. Click the **"✏️"** button next to the name
3. Enter the new name in the dialog that appears
4. Confirm the changes

### 4. Removing from Saved Chats

1. Find the chat you want to remove from saved chats
2. Click the **"🗑️"** button next to the name
3. Confirm deletion in the dialog

### 5. Reset to Default Settings

1. Click the **"🔄 Reset to Default"** button
2. Confirm the action in the dialog
3. The list will return to initial settings

## Technical Features

### Data Synchronization

- The saved chats list is stored in **chrome.storage.sync**
- Data synchronizes between devices (if Chrome sync is enabled)
- Changes are instantly applied to the active ChatGPT page

### Default Excluded Chats

By default, the list includes:

- "Game Rules for Trinka"
- "Liability for Vehicle Damage"

### Duplicate Checking

- The system automatically checks for duplicates
- Comparison is case-insensitive
- A warning appears when trying to add an existing chat

### Instant Updates

- When the list is changed in popup, changes are immediately applied in content script
- No ChatGPT page reload required
- New settings take effect immediately

## Usage Examples

### Saving Important Project Chats

```
Project Alpha - requirements
Project Beta - code review
Important work notes
```

### Saving Learning Materials

```
Learning JavaScript
React Tutorial
Algorithm Questions
```

### Saving Personal Chats

```
Vacation plans
Recipe collection
Gift ideas
```

## Security

- All data is stored locally in the browser
- No information is transmitted to external servers
- Only your extension has access to the data

---

**Tip**: Regularly check your saved chats list and remove outdated ones to avoid accidentally preserving unnecessary chats during bulk deletion.
