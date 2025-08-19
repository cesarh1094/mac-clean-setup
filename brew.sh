#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Homebrew install script..."

if [ ! "$(which brew 2>/dev/null)" ]; then
  log_info "Installing Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Check if installation was successful
  if command -v brew >/dev/null 2>&1; then
    log_success "✅ Homebrew installed successfully!"
  else
    log_error "❌ Homebrew installation failed"
  fi
else
  log_warning "Homebrew already installed"
fi

log_info "Finished Homebrew install script."
