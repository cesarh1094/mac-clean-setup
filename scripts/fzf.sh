#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running fzf install script..."

if brew list fzf >/dev/null 2>&1; then
  log_warning_sub "fzf is already installed"
else
  log_info_sub "Installing fzf"

  brew install fzf

  # Check if installation was successful
  if brew list fzf >/dev/null 2>&1; then
    log_success_sub "✅ fzf installed successfully!"
  else
    log_error_sub "❌ fzf installation failed"
    exit 1
  fi
fi

log_info "Finished fzf install script."
