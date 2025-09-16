#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Cursor Agent CLI install script..."

if command -v cursor-agent >/dev/null 2>&1; then
  log_warning_sub "Cursor Agent CLI is already installed"
else
  log_info_sub "Installing Cursor Agent CLI"

  curl https://cursor.com/install -fsS | bash

  # Add to PATH if not already present
  if ! grep -qF 'export PATH="$HOME/.local/bin:$PATH"' ~/.zshrc 2>/dev/null; then
    log_info_sub "Adding Cursor Agent to shell PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
  fi

  # Set PATH for current session
  export PATH="$HOME/.local/bin:$PATH"

  # Check if installation was successful
  if command -v cursor-agent >/dev/null 2>&1; then
    log_success_sub "✅ Cursor Agent CLI installed successfully!"
  else
    log_error_sub "❌ Cursor Agent CLI installation failed"
    exit 1
  fi
fi

log_info "Finished Cursor Agent CLI install script."
