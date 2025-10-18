# Code Focus

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/prateekbisht.code-focus)](https://marketplace.visualstudio.com/items?itemName=prateekbisht.code-focus)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/prateekbisht.code-focus)](https://marketplace.visualstudio.com/items?itemName=prateekbisht.code-focus)
[![GitHub License](https://img.shields.io/github/license/prateekbisht23/code-focus)](LICENSE)

A Visual Studio Code extension that analyzes and displays related files (dependencies and dependents) for better code navigation and productivity in TypeScript and JavaScript projects.

## Features

- **Smart File Analysis**: Automatically discovers file dependencies and dependents using TypeScript AST parsing
- **Dedicated Focus View**: Clean, organized view of related files in the Explorer panel
- **Context Menu Integration**: Right-click any TypeScript/JavaScript file to analyze relationships
- **Quick Navigation**: Click any file in the focus view to open it instantly
- **Clean Interface**: Shows only filenames with full paths available in tooltips
- **Real-time Updates**: Refreshes automatically when you focus on different files
- **High Performance**: Parallel processing for fast analysis of large codebases

## Installation

1. Open Visual Studio Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Code Focus"
4. Click **Install**

## Usage

### Method 1: Context Menu (Recommended)

1. Right-click on any `.ts`, `.tsx`, `.js`, or `.jsx` file in the Explorer
2. Select **"Focus on Related Files"**
3. View all related files in the **Code Focus** panel

### Method 2: Command Palette

1. Open a TypeScript/JavaScript file in the editor
2. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Focus on Related Files" and select the command

## What You'll See

When you focus on a file, the extension will display:

- **The focal file** you selected
- **Dependencies**: All files that your selected file imports
- **Dependents**: All files that import your selected file

### Example

If you focus on `home.tsx`:

```typescript
// home.tsx
import { Button } from "./components/Button";
import { Header } from "./components/Header";
import { useAuth } from "./hooks/useAuth";

export function Home() {
  const { user } = useAuth();
  return (
    <div>
      <Header user={user} />
      <Button onClick={() => console.log("clicked")} />
    </div>
  );
}
```

**Code Focus will show:**

- `home.tsx` (focal file)
- `Button.tsx` (dependency)
- `Header.tsx` (dependency)
- `useAuth.ts` (dependency)
- `App.tsx` (dependent - if it imports home.tsx)
- `HomePage.tsx` (dependent - if it imports home.tsx)

## Supported File Types

- **TypeScript**: `.ts`, `.tsx`
- **JavaScript**: `.js`, `.jsx`

## Configuration

Code Focus includes the following settings:

| Setting          | Description                                         | Default |
| ---------------- | --------------------------------------------------- | ------- |
| `focus.showView` | Show/hide the Code Focus view in the Explorer panel | `true`  |

Access settings via: File → Preferences → Settings → Search for "Code Focus"

## Use Cases

- **Code Review**: Understand the impact of changes across related files
- **Debugging**: Quickly navigate between related components and utilities
- **Refactoring**: See all affected files before making changes
- **Learning**: Understand how files are connected in unfamiliar codebases
- **Documentation**: Map out file relationships in your project

## Commands

| Command                  | Description                        | Access           |
| ------------------------ | ---------------------------------- | ---------------- |
| `Focus on Related Files` | Analyze and focus on related files | Right-click menu |
| `Focus: Clear`           | Clear the focus view               | Command palette  |

## Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues**: [GitHub Issues](https://github.com/prateekbisht23/code-focus/issues)
2. **Feature Requests**: [GitHub Discussions](https://github.com/prateekbisht23/code-focus/discussions)
3. **Code Contributions**: Fork the repo and submit a PR

### Development Setup

```bash
git clone https://github.com/prateekbisht23/code-focus.git
cd code-focus
npm install
npm run compile
# Press F5 to start debugging
```

## Known Issues

- Large workspaces (>1000 files) may experience slower analysis times
- Dynamic imports are not currently supported
- Barrel exports may not be fully resolved

## Changelog

### 1.0.0 (Latest)

- Initial release
- Smart dependency and dependent analysis
- Clean file name display with tooltips
- Context menu and command palette integration
- Real-time Code Focus view

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Support

If you find Code Focus helpful:

- Star the [GitHub repository](https://github.com/prateekbisht23/code-focus)
- Leave a review on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=prateekbisht23.code-focus)
- Share it with your team

---

**Made by [Prateek Bisht](https://github.com/prateekbisht23)**

```

```
