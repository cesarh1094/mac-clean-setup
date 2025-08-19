#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Ghostty install script..."

if brew list --cask ghostty >/dev/null 2>&1; then
  log_warning "Ghostty is already installed"
else
  log_info "Installing Ghostty"

  brew install --cask ghostty

  # Check if installation was successful
  if brew list --cask ghostty >/dev/null 2>&1; then
    log_success "✅ Ghostty installed successfully!"
  else
    log_error "❌ Ghostty installation failed"
  fi
fi

log_info "Finished Ghostty install script."
