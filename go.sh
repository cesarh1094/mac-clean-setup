#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Go install script..."

if brew list go >/dev/null 2>&1; then
  log_warning "Go is already installed"
else
  log_info "Installing Go"

  brew install go

  # Check if installation was successful
  if brew list go >/dev/null 2>&1; then
    log_success "✅ Go installed successfully!"
  else
    log_error "❌ Go installation failed"
  fi
fi

log_info "Finished Go install script."
