#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Claude Code install script..."

if ! command -v claude >/dev/null 2>&1; then
  log_info_sub "Installing Claude Code"

  npm install -g @anthropic-ai/claude-code

  # Check if installation was successful
  if command -v claude >/dev/null 2>&1; then
    log_success_sub "✅ Claude Code installed successfully!"
  else
    log_error_sub "❌ Claude Code installation failed"
    exit 1
  fi
else
  log_warning_sub "Claude Code already installed"
fi

log_info "Finished Claude Code install script."
