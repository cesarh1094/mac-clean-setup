#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Raycast install script..."

if brew list --cask raycast >/dev/null 2>&1; then
  log_warning "Raycast is already installed"
else
  log_info "Installing Raycast"

  brew install --cask raycast

  # Check if installation was successful
  if brew list --cask raycast >/dev/null 2>&1; then
    log_success "✅ Raycast installed successfully!"
  else
    log_error "❌ Raycast installation failed"
  fi
fi

log_info "Finished Raycast install script."
