#!/bin/bash

source "$(dirname "$0")/colors.sh"

log_info "Running Neovim setup script..."

# Install neovim if it doesn't exist
if brew list neovim >/dev/null 2>&1; then
  log_warning_sub "Neovim is already installed"
else
  log_info_sub "Installing Neovim"
  brew install neovim
  
  if brew list neovim >/dev/null 2>&1; then
    log_success_sub "✅ Neovim installed successfully!"
  else
    log_error_sub "❌ Neovim installation failed"
  fi
fi

# Create .config directory if it doesn't exist
if [ ! -d ~/.config ]; then
  log_info_sub "Creating missing '.config' folder"
  mkdir -p ~/.config
fi

# Install lazygit if it doesn't exist
if brew list lazygit >/dev/null 2>&1; then
  log_warning_sub "Lazygit is already installed"
else
  log_info_sub "Installing Lazygit"
  brew install lazygit
  
  if brew list lazygit >/dev/null 2>&1; then
    log_success_sub "✅ Lazygit installed successfully!"
  else
    log_error_sub "❌ Lazygit installation failed"
  fi
fi

# Install ripgrep if it doesn't exist
if brew list ripgrep >/dev/null 2>&1; then
  log_warning_sub "Ripgrep is already installed"
else
  log_info_sub "Installing Ripgrep"
  brew install ripgrep
  
  if brew list ripgrep >/dev/null 2>&1; then
    log_success_sub "✅ Ripgrep installed successfully!"
  else
    log_error_sub "❌ Ripgrep installation failed"
  fi
fi

# Install fzf if it doesn't exist
if brew list fzf >/dev/null 2>&1; then
  log_warning_sub "FZF is already installed"
else
  log_info_sub "Installing FZF"
  brew install fzf
  
  if brew list fzf >/dev/null 2>&1; then
    log_success_sub "✅ FZF installed successfully!"
  else
    log_error_sub "❌ FZF installation failed"
  fi
fi

# Clone neovim config if it doesn't exist
if [ ! -d ~/.config/nvim ]; then
  log_info_sub "Cloning Neovim config"
  git clone https://github.com/cesarh1094/config.nvim.git ~/.config/nvim
  
  if [ -d ~/.config/nvim ]; then
    log_success_sub "✅ Neovim config cloned successfully!"
  else
    log_error_sub "❌ Neovim config cloning failed"
  fi
else
  log_warning_sub "Neovim config already exists"
fi

log_info "Finished Neovim setup script."
