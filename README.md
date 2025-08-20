# Machine Setup

Automated macOS development environment setup using Homebrew and shell scripts.

## Quick Start

```bash
git clone <this-repo>
cd machine-setup
./setup.sh
```

## What Gets Installed

The `setup.sh` script runs these installation scripts:

- **`brew.sh`** - Installs Homebrew package manager
- **`ghostty.sh`** - Installs Ghostty terminal emulator
- **`raycast.sh`** - Installs Raycast launcher/productivity tool
- **`go.sh`** - Installs Go programming language
- **`github-cli.sh`** - Installs GitHub CLI (`gh` command)
- **`karabiner-elements.sh`** - Installs Karabiner Elements keyboard customizer

### Optional Scripts (commented out)
- **`node.sh`** - Installs Node.js
- **`nvm.sh`** - Installs Node Version Manager
- **`zellij.sh`** - Installs Zellij terminal multiplexer

### Additional Tools
- **`neovim.sh`** - Installs Neovim + dependencies (ripgrep, fzf, lazygit) + config
- **`claude-code.sh`** - Installs Claude Code CLI
- **`open-code.sh`** - Installs OpenCode TUI
- **`cursor.sh`** - Installs Cursor editor

## Individual Installation

Run any script independently:
```bash
./go.sh          # Install just Go
./ghostty.sh     # Install just Ghostty
```

## Logging

All scripts use colored logging via `colors.sh` with standardized output:
- 🔵 `[INFO]` - Installation progress
- 🟡 `[WARNING]` - Already installed
- 🟢 `[SUCCESS]` - Installation complete
- 🔴 `[ERROR]` - Installation failed