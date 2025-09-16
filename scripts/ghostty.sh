#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Ghostty install script..."

if brew list --cask ghostty >/dev/null 2>&1; then
  log_warning_sub "Ghostty is already installed"
else
  log_info_sub "Installing Ghostty"

  brew install --cask ghostty

  # Check if installation was successful
  if brew list --cask ghostty >/dev/null 2>&1; then
    log_success_sub "✅ Ghostty installed successfully!"
  else
    log_error_sub "❌ Ghostty installation failed"
    exit 1
  fi
fi

log_info "Finished Ghostty install script."
