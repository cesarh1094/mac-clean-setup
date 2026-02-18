#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running ripgrep install script..."

if brew list ripgrep >/dev/null 2>&1; then
  log_warning_sub "ripgrep is already installed"
else
  log_info_sub "Installing ripgrep"

  brew install ripgrep

  # Check if installation was successful
  if brew list ripgrep >/dev/null 2>&1; then
    log_success_sub "✅ ripgrep installed successfully!"
  else
    log_error_sub "❌ ripgrep installation failed"
    exit 1
  fi
fi

log_info "Finished ripgrep install script."
