#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Bun install script..."

if brew list oven-sh/bun/bun >/dev/null 2>&1; then
  log_warning_sub "Bun is already installed"
else
  log_info_sub "Installing Bun"

  brew install oven-sh/bun/bun

  # Check if installation was successful
  if brew list oven-sh/bun/bun >/dev/null 2>&1; then
    log_success_sub "✅ Bun installed successfully!"
  else
    log_error_sub "❌ Bun installation failed"
  fi
fi

log_info "Finished Bun install script."