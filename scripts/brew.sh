#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Homebrew install script..."

if ! command -v brew >/dev/null 2>&1; then
  log_info_sub "Installing Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Initialize Homebrew in current shell
  eval "$(/opt/homebrew/bin/brew shellenv)"

  # Add to shell profile if not already present
  if ! grep -q 'eval "$(/opt/homebrew/bin/brew shellenv)"' ~/.zprofile 2>/dev/null; then
    log_info_sub "Adding Homebrew to shell profile"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  fi

  # Check if installation was successful
  if command -v brew >/dev/null 2>&1; then
    log_success_sub "✅ Homebrew installed successfully!"
  else
    log_error_sub "❌ Homebrew installation failed"
    exit 1
  fi
else
  log_warning_sub "Homebrew already installed"
fi

log_info "Finished Homebrew install script."
