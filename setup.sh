#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running main setup script"

log_info "Setting up repository permissions..."

# Find all .sh files and make them executable
find . -name "*.sh" -type f -exec chmod +x {} \;

# Foundation - Install package manager first
./brew.sh

# Programming languages and runtimes
./node.sh
./nvm.sh
./bun.sh
./go.sh

# System and productivity tools
./karabiner-elements.sh
./raycast.sh

# Terminal and editors
./ghostty.sh
./cursor.sh
./neovim.sh
./zellij.sh

# CLI tools (depend on above runtimes)
./github-cli.sh
./claude-code.sh
./open-code.sh


