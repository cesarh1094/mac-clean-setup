#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Cursor install script..."

if brew list --cask cursor >/dev/null 2>&1; then
  log_warning_sub "Cursor is already installed"
else
  log_info_sub "Installing Cursor"

  brew install --cask cursor

  # Check if installation was successful
  if brew list --cask cursor >/dev/null 2>&1; then
    log_success_sub "✅ Cursor installed successfully!"
  else
    log_error_sub "❌ Cursor installation failed"
  fi
fi

log_info "Finished Cursor install script."
