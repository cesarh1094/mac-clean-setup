# AGENTS.md - Guidelines for AI Coding Agents

## Build/Test Commands
- **Main setup**: `./setup.sh` (runs core installation scripts)
- **Individual tools**: `./<tool-name>.sh` (e.g., `./brew.sh`, `./go.sh`)
- **Make executable**: `chmod +x *.sh` (auto-run by setup.sh)
- **No testing framework** - this is an installation script repository

## Code Style Guidelines
- **Language**: Bash shell scripts only
- **Shebang**: Always start with `#!/bin/bash`
- **Imports**: Source colors.sh: `source "$(dirname "$0")/colors.sh"`
- **Logging**: Use log_info, log_success, log_warning, log_error functions
- **Error handling**: Check command success with exit codes and conditionals
- **Naming**: Kebab-case for files (e.g., `github-cli.sh`), snake_case for functions
- **Structure**: Import colors → log start → check if installed → install → verify → log finish
- **Consistency**: Follow existing patterns for brew install checks and success/failure logging
- **Comments**: Inline comments for complex conditions, header comments for file purpose
- **Dependencies**: All scripts depend on Homebrew and colors.sh logging functions

## Installation Pattern
```bash
if brew list <package> >/dev/null 2>&1; then
  log_warning "Package already installed"
else
  log_info "Installing Package"
  brew install <package>
  # Verify installation and log result
fi
```