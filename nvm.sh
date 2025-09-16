#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running NVM install script..."

if [ -d "$HOME/.nvm" ]; then
  log_warning_sub "NVM is already installed"
else
  log_info_sub "Installing NVM"

  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

  # Check if installation was successful
  if [ -d "$HOME/.nvm" ]; then
    log_success_sub "✅ NVM installed successfully!"
  else
    log_error_sub "❌ NVM installation failed"
    exit 1
  fi
fi

log_info "Finished NVM install script."
