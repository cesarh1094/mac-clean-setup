#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running OpenCode TUI install script..."

if brew list opencode >/dev/null 2>&1; then
  log_warning_sub "OpenCode TUI is already installed"
else
  log_info_sub "Installing OpenCode TUI"

  brew install sst/tap/opencode

  # Check if installation was successful
  if brew list opencode >/dev/null 2>&1; then
    log_success_sub "✅ OpenCode TUI installed successfully!"
  else
    log_error_sub "❌ OpenCode TUI installation failed"
    exit 1
  fi
fi

log_info "Finished OpenCode TUI install script."
