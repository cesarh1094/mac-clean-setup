#!/bin/bash

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/colors.sh"

log_info "Running main setup script"

log_info "Setting up repository permissions..."

# Find all .sh files in scripts directory and make them executable
find "$DIR" -name "*.sh" -type f -exec chmod +x {} \;

# Foundation - Install package manager first
"$DIR/brew.sh" || { log_error "Homebrew installation failed"; exit 1; }

# Programming languages and runtimes (NVM first for Node management)
"$DIR/nvm.sh" || { log_error "NVM installation failed"; exit 1; }
"$DIR/node.sh" || { log_error "Node.js installation failed"; exit 1; }
"$DIR/bun.sh" || { log_error "Bun installation failed"; exit 1; }
"$DIR/go.sh" || { log_error "Go installation failed"; exit 1; }

# System and productivity tools
"$DIR/karabiner-elements.sh" || { log_error "Karabiner Elements installation failed"; exit 1; }
"$DIR/raycast.sh" || { log_error "Raycast installation failed"; exit 1; }

# Terminal and editors
"$DIR/ghostty.sh" || { log_error "Ghostty installation failed"; exit 1; }
"$DIR/cursor.sh" || { log_error "Cursor installation failed"; exit 1; }
"$DIR/neovim.sh" || { log_error "Neovim setup failed"; exit 1; }
"$DIR/zellij.sh" || { log_error "Zellij installation failed"; exit 1; }

# CLI tools (depend on above runtimes)
"$DIR/github-cli.sh" || { log_error "GitHub CLI installation failed"; exit 1; }
"$DIR/claude-code.sh" || { log_error "Claude Code installation failed"; exit 1; }
"$DIR/open-code.sh" || { log_error "OpenCode TUI installation failed"; exit 1; }
"$DIR/cursor-agent.sh" || { log_error "Cursor Agent CLI installation failed"; exit 1; }

log_success "Setup completed successfully!"
