#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running GitHub CLI install script..."

if brew list gh >/dev/null 2>&1; then
  log_warning_sub "GitHub CLI is already installed"
else
  log_info_sub "Installing GitHub CLI"

  brew install gh

  # Check if installation was successful
  if brew list gh >/dev/null 2>&1; then
    log_success_sub "✅ GitHub CLI installed successfully!"
  else
    log_error_sub "❌ GitHub CLI installation failed"
    exit 1
  fi
fi

log_info "Finished GitHub CLI install script."
