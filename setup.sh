#!/bin/bash

set -euo pipefail

source "$(dirname "$0")/colors.sh"

log_info "Running main setup script"

log_info "Setting up repository permissions..."

# Find all .sh files and make them executable
find . -name "*.sh" -type f -exec chmod +x {} \;

# Foundation - Install package manager first
./brew.sh || { log_error "Homebrew installation failed"; exit 1; }

# Programming languages and runtimes (NVM first for Node management)
./nvm.sh || { log_error "NVM installation failed"; exit 1; }
./node.sh || { log_error "Node.js installation failed"; exit 1; }
./bun.sh || { log_error "Bun installation failed"; exit 1; }
./go.sh || { log_error "Go installation failed"; exit 1; }

# System and productivity tools
./karabiner-elements.sh || { log_error "Karabiner Elements installation failed"; exit 1; }
./raycast.sh || { log_error "Raycast installation failed"; exit 1; }

# Terminal and editors
./ghostty.sh || { log_error "Ghostty installation failed"; exit 1; }
./cursor.sh || { log_error "Cursor installation failed"; exit 1; }
./neovim.sh || { log_error "Neovim setup failed"; exit 1; }
./zellij.sh || { log_error "Zellij installation failed"; exit 1; }

# CLI tools (depend on above runtimes)
./github-cli.sh || { log_error "GitHub CLI installation failed"; exit 1; }
./claude-code.sh || { log_error "Claude Code installation failed"; exit 1; }
./open-code.sh || { log_error "OpenCode TUI installation failed"; exit 1; }
./cursor-agent.sh || { log_error "Cursor Agent CLI installation failed"; exit 1; }

log_success "Setup completed successfully!"
