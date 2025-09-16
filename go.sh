#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Go install script..."

if brew list go >/dev/null 2>&1; then
  log_warning_sub "Go is already installed"
else
  log_info_sub "Installing Go"

  brew install go

  # Check if installation was successful
  if brew list go >/dev/null 2>&1; then
    log_success_sub "✅ Go installed successfully!"
  else
    log_error_sub "❌ Go installation failed"
    exit 1
  fi
fi

log_info "Finished Go install script."
