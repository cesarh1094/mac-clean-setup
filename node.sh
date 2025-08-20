#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Node.js install script..."

if brew list node >/dev/null 2>&1; then
  log_warning_sub "Node.js is already installed"
else
  log_info_sub "Installing Node.js"

  brew install node

  # Check if installation was successful
  if brew list node >/dev/null 2>&1; then
    log_success_sub "✅ Node.js installed successfully!"
  else
    log_error_sub "❌ Node.js installation failed"
  fi
fi

log_info "Finished Node.js install script."
