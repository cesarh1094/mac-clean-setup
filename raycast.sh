#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Raycast install script..."

if brew list --cask raycast >/dev/null 2>&1; then
  log_warning_sub "Raycast is already installed"
else
  log_info_sub "Installing Raycast"

  brew install --cask raycast

  # Check if installation was successful
  if brew list --cask raycast >/dev/null 2>&1; then
    log_success_sub "✅ Raycast installed successfully!"
  else
    log_error_sub "❌ Raycast installation failed"
    exit 1
  fi
fi

log_info "Finished Raycast install script."
