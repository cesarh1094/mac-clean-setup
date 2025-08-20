#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Zellij install script..."

if brew list zellij >/dev/null 2>&1; then
  log_warning_sub "Zellij is already installed"
else
  log_info_sub "Installing Zellij"

  brew install zellij

  # Check if installation was successful
  if brew list zellij >/dev/null 2>&1; then
    log_success_sub "✅ Zellij installed successfully!"
  else
    log_error_sub "❌ Zellij installation failed"
  fi
fi

log_info "Finished Zellij install script."
