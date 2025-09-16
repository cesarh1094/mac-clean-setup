# Machine Setup

Automated macOS development environment setup using Homebrew and shell scripts with dependency-aware execution order and consistent error handling.

## Quick Start

```bash
git clone <this-repo>
cd machine-setup
./setup.sh
```

## Installation Architecture

The `setup.sh` script executes all installation scripts in optimized dependency order:

### **1. Foundation**
- **`brew.sh`** - Homebrew package manager (required by most tools)

### **2. Programming Languages & Runtimes**
- **`nvm.sh`** - Node Version Manager (installed first for Node management)
- **`node.sh`** - Node.js LTS via NVM (replaces Homebrew Node for better version control)
- **`bun.sh`** - Bun JavaScript runtime and package manager
- **`go.sh`** - Go programming language

### **3. System & Productivity Tools**
- **`karabiner-elements.sh`** - Keyboard customizer (Karabiner Elements)
- **`raycast.sh`** - Launcher and productivity tool

### **4. Terminal & Editors**
- **`ghostty.sh`** - Modern terminal emulator
- **`cursor.sh`** - AI-powered code editor
- **`neovim.sh`** - Neovim + dev tools (ripgrep, fzf, lazygit) + personal config
- **`zellij.sh`** - Terminal multiplexer

### **5. CLI Tools** 
- **`github-cli.sh`** - GitHub CLI (`gh` command)
- **`claude-code.sh`** - Claude Code CLI (requires npm from NVM-managed Node)
- **`open-code.sh`** - OpenCode TUI
- **`cursor-agent.sh`** - Cursor Agent CLI

## Individual Installation

Run any script independently:
```bash
./go.sh          # Install just Go
./ghostty.sh     # Install just Ghostty
./neovim.sh      # Install Neovim ecosystem
```

## Script Features

All installation scripts follow standardized patterns:

### **Consistent Logging**
- 🔵 `[INFO]` - Installation progress and script status  
- 🟡 `[WARNING]` - Tool already installed (skipped)
- 🟢 `[SUCCESS]` - Installation completed successfully
- 🔴 `[ERROR]` - Installation failed

### **Smart Installation Checks**
- **Homebrew formulas**: `brew list <package>` verification
- **Homebrew casks**: `brew list --cask <package>` verification
- **Pre-installation detection** prevents unnecessary reinstalls
- **Post-installation verification** confirms success

### **Error Handling**
- Graceful handling of existing installations
- Clear feedback on installation success/failure
- Standardized exit codes and error reporting
- **Fail-fast execution**: Setup stops immediately on any installation failure

## Repository Structure

```
machine-setup/
├── setup.sh              # Main orchestration script
├── colors.sh            # Shared logging functions
├── AGENTS.md            # Guidelines for AI agents
├── README.md            # This documentation
└── [tool-name].sh       # Individual installation scripts
```