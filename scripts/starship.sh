#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Starship install script..."

if brew list starship >/dev/null 2>&1; then
  log_warning_sub "Starship is already installed"
else
  log_info_sub "Installing Starship"

  brew install starship

  # Check if installation was successful
  if brew list starship >/dev/null 2>&1; then
    log_success_sub "✅ Starship installed successfully!"
  else
    log_error_sub "❌ Starship installation failed"
    exit 1
  fi
fi

log_info "Finished Starship install script."
