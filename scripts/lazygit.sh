#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running lazygit install script..."

if brew list lazygit >/dev/null 2>&1; then
  log_warning_sub "lazygit is already installed"
else
  log_info_sub "Installing lazygit"

  brew install lazygit

  # Check if installation was successful
  if brew list lazygit >/dev/null 2>&1; then
    log_success_sub "✅ lazygit installed successfully!"
  else
    log_error_sub "❌ lazygit installation failed"
    exit 1
  fi
fi

log_info "Finished lazygit install script."
