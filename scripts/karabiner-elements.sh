#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Karabiner Elements install script..."

if brew list --cask karabiner-elements >/dev/null 2>&1; then
  log_warning_sub "Karabiner Elements is already installed"
else
  log_info_sub "Installing Karabiner Elements"

  brew install --cask karabiner-elements

  # Check if installation was successful
  if brew list --cask karabiner-elements >/dev/null 2>&1; then
    log_success_sub "✅ Karabiner Elements installed successfully!"
  else
    log_error_sub "❌ Karabiner Elements installation failed"
    exit 1
  fi
fi

log_info "Finished Karabiner Elements install script."
