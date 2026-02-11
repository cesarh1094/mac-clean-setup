#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running fd install script..."

if brew list fd >/dev/null 2>&1; then
  log_warning_sub "fd is already installed"
else
  log_info_sub "Installing fd"

  brew install fd

  # Check if installation was successful
  if brew list fd >/dev/null 2>&1; then
    log_success_sub "✅ fd installed successfully!"
  else
    log_error_sub "❌ fd installation failed"
    exit 1
  fi
fi

log_info "Finished fd install script."
