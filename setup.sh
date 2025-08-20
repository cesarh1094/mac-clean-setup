#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running main setup script"

log_info "Setting up repository permissions..."

# Find all .sh files and make them executable
find . -name "*.sh" -type f -exec chmod +x {} \;

./brew.sh
./ghostty.sh
./raycast.sh
./go.sh
./github-cli.sh
./karabiner-elements.sh
# ./node.sh
# ./nvm.sh
# ./zellij.sh
