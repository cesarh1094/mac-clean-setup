#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Homebrew install script..."

if [ ! "$(which claude 2>/dev/null)" ]; then
  log_info_sub "Installing Claude Code"

  npm install -g @anthropic-ai/claude-code

  # Check if installation was successful
  if command -v claude >/dev/null 2>&1; then
    log_success "✅ Claude Code installed successfully!"
  else
    log_error "❌ Claude Code installation failed"
  fi
else
  log_warning "Claude Code already installed"
fi
