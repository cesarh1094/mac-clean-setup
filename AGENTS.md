# AGENTS.md - Guidelines for AI Coding Agents

## Build/Test Commands
- **Main setup**: `./setup.sh` (runs all installation scripts in dependency order)
- **Individual tools**: `./<tool-name>.sh` (e.g., `./brew.sh`, `./go.sh`)
- **Make executable**: `chmod +x *.sh` (auto-run by setup.sh)
- **No testing framework** - this is an installation script repository

## Project Architecture
This repository contains 15+ macOS development environment installation scripts with:
- **Dependency-aware execution order** in setup.sh (Foundation → Runtimes → Productivity → Terminal/Editors → CLI Tools)
- **Consistent error handling** and installation verification across all scripts
- **Standardized logging** with colored output via colors.sh
- **Smart detection** of existing installations to prevent conflicts

## Code Style Guidelines
- **Language**: Bash shell scripts only
- **Shebang**: Always start with `#!/bin/bash`
- **Imports**: Source colors.sh: `source "$(dirname "$0")/colors.sh"`
- **Logging**: Use log_info, log_success_sub, log_warning_sub, log_error_sub functions
- **Error handling**: Check command success with exit codes and conditionals
- **Naming**: Kebab-case for files (e.g., `github-cli.sh`), snake_case for functions
- **Structure**: Import colors → log start → check if installed → install → verify → log finish
- **Consistency**: Follow existing patterns for brew install checks and success/failure logging
- **Comments**: Inline comments for complex conditions, header comments for file purpose
- **Dependencies**: Most scripts depend on Homebrew; claude-code.sh requires npm from NVM-managed Node; setup.sh orchestrates execution order with fail-fast behavior

## Installation Patterns

### Homebrew Formula Pattern
```bash
if brew list <package> >/dev/null 2>&1; then
  log_warning_sub "Package already installed"
else
  log_info_sub "Installing Package"
  brew install <package>
  # Verify installation and log result
fi
```

### Homebrew Cask Pattern  
```bash
if brew list --cask <package> >/dev/null 2>&1; then
  log_warning_sub "Package already installed"
else
  log_info_sub "Installing Package"
  brew install --cask <package>
  # Verify installation and log result
fi
```

## Current Scripts
- **Foundation**: brew.sh
- **Runtimes**: nvm.sh, node.sh (NVM-managed), bun.sh, go.sh  
- **Productivity**: karabiner-elements.sh, raycast.sh
- **Terminal/Editors**: ghostty.sh, cursor.sh, neovim.sh, zellij.sh
- **CLI Tools**: github-cli.sh, claude-code.sh, open-code.sh, cursor-agent.sh
- **Utilities**: colors.sh (shared logging functions)