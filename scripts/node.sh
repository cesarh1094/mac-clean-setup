#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Node.js install script..."

# Source NVM if available
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
else
  log_error_sub "❌ NVM not found. Please run nvm.sh first"
  exit 1
fi

# Check if Node LTS is already installed and set as default
if nvm which node >/dev/null 2>&1 && nvm current | grep -q "v"; then
  log_warning_sub "Node.js is already installed via NVM"
else
  log_info_sub "Installing Node.js LTS via NVM"

  # Install latest LTS version
  nvm install --lts

  # Set LTS as default
  nvm alias default node

  # Use the installed version
  nvm use default

  # Check if installation was successful
  if nvm which node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    log_success_sub "✅ Node.js ${NODE_VERSION} installed successfully via NVM!"
  else
    log_error_sub "❌ Node.js installation via NVM failed"
    exit 1
  fi
fi

log_info "Finished Node.js install script."
