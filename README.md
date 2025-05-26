# 🗑️ ChatGPT Bulk Chat Remover

A powerful Chrome extension for bulk deleting ChatGPT conversations with advanced features like auto-scroll, selective deletion, and saved chat management.

## ✨ Features

- **📜 Auto-scroll**: Automatically loads all chat conversations using lazy loading
- **✅ Bulk Selection**: Select all chats at once (excluding saved ones)
- **❌ Quick Unselect**: Instantly unselect all chats with one click
- **🛡️ Saved Chats Management**: Protect important conversations from deletion
- **🔒 Automatic Token Capture**: Seamlessly intercepts authentication tokens
- **🗑️ API-based Deletion**: Fast and reliable deletion through ChatGPT's API
- **📊 Progress Indicator**: Real-time status updates during operations
- **💾 Persistent Storage**: Saved chats sync across devices
- **🎨 Modern UI**: Beautiful, responsive interface with hover effects

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)

_Coming soon - extension will be published to Chrome Web Store_

### Method 2: Manual Installation (Developer Mode)

1. **Download the extension**:

   - Clone this repository or download as ZIP
   - Extract to a folder on your computer

2. **Enable Developer Mode**:

   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - The extension icon should appear in your toolbar

## 📖 How to Use

### Basic Usage

1. **Navigate to ChatGPT**: Go to [chatgpt.com](https://chatgpt.com)
2. **Extension Auto-loads**: The interface appears automatically in the sidebar
3. **Load All Chats**: Click "📜 Load All Chats" to scroll and load all conversations
4. **Select Chats**: Click "✅ Select All" to select all chats (except saved ones)
5. **Delete**: Click "🗑 Delete Selected" to remove selected conversations

### Managing Saved Chats

1. **Open Extension Popup**: Click the extension icon in your browser toolbar
2. **Go to Saved Chats Tab**: Click on "Saved Chats" tab
3. **Add New Saved Chat**:
   - Type the chat name in the input field
   - Click "➕ Add" or press Enter
4. **Edit Saved Chat**: Click "✏️" next to any chat name
5. **Remove Saved Chat**: Click "🗑️" next to any chat name
6. **Reset to Default**: Click "🔄 Reset to Default" to restore original settings

### Interface Controls

- **📜 Load All Chats**: Auto-scrolls to load all conversations
- **✅ Select All**: Selects all chats except those in your saved list
- **❌ Unselect All**: Quickly removes all selections
- **🗑 Delete Selected**: Permanently deletes selected conversations

## 🛡️ Default Saved Chats

The extension comes with these default saved chats:

- "Game Rules for Trinka"
- "Liability for Vehicle Damage"

You can modify this list through the extension popup interface.

## 🔧 Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension standards
- **Content Script**: Handles ChatGPT page interaction
- **Injected Script**: Captures authentication tokens
- **Popup Interface**: Manages saved chats and settings
- **Chrome Storage**: Syncs data across devices

### Permissions

- `activeTab`: Access to current ChatGPT tab
- `storage`: Save and sync user preferences
- `host_permissions`: Access to chatgpt.com and chat.openai.com

### Security

- All data stored locally in browser
- No external server communication
- Secure token handling
- No personal data collection

## 🎨 UI Features

### Modern Button Design

- Colorful, intuitive button styling
- Smooth hover animations
- Click feedback effects
- Responsive layout

### Color Scheme

- 🔵 **Load Chats**: Blue (`#2196F3`)
- 🟢 **Select All**: Green (`#4CAF50`)
- 🟠 **Unselect All**: Orange (`#FF9800`)
- 🔴 **Delete**: Red (`#f44336`)

## 📁 Project Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main functionality
├── injected.js           # Token interception
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── docs/                 # Documentation
    └── EXCLUDED_CHATS.md # Saved chats guide
```

## 🔄 Version History

### Version 2.0 (Current)

- ✅ Complete English translation
- ✅ Modern button design with hover effects
- ✅ Unselect all functionality
- ✅ Enhanced saved chats management
- ✅ Improved error handling
- ✅ Better user experience

### Version 1.0

- ✅ Basic bulk deletion functionality
- ✅ Auto-scroll and token capture
- ✅ Saved chats feature
- ✅ Chrome extension architecture

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Make your changes in the `chrome-extension/` directory
3. Test the extension in Chrome developer mode
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This extension is not affiliated with OpenAI or ChatGPT. Use at your own risk. Always backup important conversations before bulk deletion.

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/your-username/chatgpt-bulk-chat-remover/issues) page to report bugs or request new features.

---

**Made with ❤️ for the ChatGPT community**
