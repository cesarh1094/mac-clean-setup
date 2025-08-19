#!/bin/bash

if [ ! "$(which nvim 2>/dev/null)" ]; then
  # Install neovim if it doesn't exist
  brew install neovim
fi

if [ ! -d ~/.config ]; then
  # Create '.config' file if it doesn't exist
  echo "Creating missing '.config' folder"
  mkdir -p ~/.config
fi

if [ ! "$(which lazygit 2>/dev/null)" ]; then
  # Install lazygit if it doesn't exist
  echo "Installing missing lazygit"
  brew install lazygit
fi

if [ ! "$(which rg 2>/dev/null)" ]; then
  # Install ripgrep if it doesn't exist
  echo "Installing missing ripgrep"
  brew install ripgrep
fi

if [ ! "$(which fzf 2>/dev/null)" ]; then
  # Install fzf if it doesn't exist
  echo "Installing missing fzf"
  brew install fzf
fi

if [ ! -d ~/.config/nvim ]; then
  # Clone neovim config
  echo 'Cloning Neovim config'
  git clone https://github.com/cesarh1094/config.nvim.git ~/.config/nvim
fi
