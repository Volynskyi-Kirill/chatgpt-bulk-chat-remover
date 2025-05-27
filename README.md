# ChatGPT Bulk Chat Remover - TypeScript Edition

A Chrome extension for bulk deleting ChatGPT conversations with TypeScript support for better development experience.

## 🚀 Features

- **Auto-scroll**: Automatically loads all chats via lazy loading
- **Smart Selection**: Mass selection with exclusions for important chats
- **Token Interception**: Automatically captures authorization tokens
- **Bulk Deletion**: API-based deletion with progress indicators
- **Saved Chats**: Manage protected chats that won't be deleted
- **TypeScript**: Full TypeScript support with compile-time error checking

## 🛠️ Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser for testing

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chatgpt-bulk-chat-remover/chrome-extension
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Development Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and auto-compile
- `npm run dev` - Development mode with watch
- `npm run type-check` - Type checking without compilation
- `npm run clean` - Clean compiled files

### Project Structure

```
chrome-extension/
├── src/                          # TypeScript source files
│   ├── shared-constants.ts       # Global constants and types
│   ├── content.ts                # Content script main file
│   ├── popup.ts                  # Popup script main file
│   └── modules/                  # Modular components
│       ├── storage-service.ts    # Chrome storage management
│       ├── ui-components.ts      # UI component factories
│       └── chat-operations.ts    # Chat loading and deletion
├── dist/                         # Compiled JavaScript (auto-generated)
├── icons/                        # Extension icons
├── manifest.json                 # Chrome extension manifest
├── popup.html                    # Popup interface
├── injected.js                   # Token interception script
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:

- Compile target: ES2020
- Module system: None (for Chrome extension compatibility)
- Strict type checking enabled
- Source maps for debugging
- Declaration files generation

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Compile** using `npm run build` or `npm run watch`
3. **Load extension** in Chrome from the project directory
4. **Test** functionality on chatgpt.com
5. **Debug** using Chrome DevTools with source maps

### Chrome Extension Loading

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` directory
5. The extension will appear in your extensions list

### Architecture

The extension uses a modular architecture with:

- **IIFE Pattern**: Each module wraps itself in an IIFE for isolation
- **Global Window Objects**: Modules attach themselves to `window` for cross-module communication
- **Inline Types**: Type definitions are included inline to avoid import issues
- **Chrome Extension APIs**: Full TypeScript support for Chrome extension APIs

### Type Safety

All code is fully typed with:

- Interface definitions for all data structures
- Type annotations for function parameters and return values
- Strict null checks and undefined handling
- Chrome API type definitions

### Building for Production

```bash
# Clean previous build
npm run clean

# Build optimized version
npm run build

# The dist/ folder contains the compiled JavaScript
```

### Debugging

- Source maps are generated for debugging TypeScript in Chrome DevTools
- Use `console.log` statements in TypeScript - they'll appear in the browser console
- Chrome extension debugging tools are available in DevTools

### Common Issues

1. **Import/Export Errors**: The extension uses global window objects instead of ES6 modules
2. **Type Errors**: Run `npm run type-check` to see all type issues
3. **Compilation Errors**: Check `tsconfig.json` for configuration issues

### Contributing

1. Make changes to TypeScript files in `src/`
2. Ensure `npm run type-check` passes
3. Test the compiled extension in Chrome
4. Submit pull request with both TypeScript and compiled JavaScript

## 📝 Usage

1. Install and load the extension in Chrome
2. Navigate to chatgpt.com
3. The extension interface will appear in the chat sidebar
4. Use the buttons to:
   - Load all chats (auto-scroll)
   - Select/unselect chats
   - Delete selected chats
5. Manage saved chats in the extension popup

## 🔧 Technical Details

- **Content Script**: Injects UI and handles chat operations
- **Popup Script**: Manages saved chats configuration
- **Token Interception**: Captures API tokens from network requests
- **Storage**: Uses Chrome sync storage for saved chats
- **API Integration**: Direct calls to ChatGPT backend API

## 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

