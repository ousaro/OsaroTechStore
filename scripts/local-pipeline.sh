#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: ./scripts/local-pipeline.sh [--skip-install] [--ci-install]

Runs the local backend verification pipeline:
  1. npm install
  2. npm run format:check
  3. npm run lint
  4. npm run coverage:sonar

Options:
  --skip-install   Reuse existing backend/node_modules instead of installing.
  --ci-install     Use npm ci instead of npm install, matching GitHub Actions.
  -h, --help       Show this help.
USAGE
}

skip_install=false
install_command=(npm install)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-install)
      skip_install=true
      shift
      ;;
    --ci-install)
      install_command=(npm ci)
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backend_dir="$repo_root/backend"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found on PATH." >&2
  exit 1
fi

node_version="$(node --version)"
node_major="${node_version#v}"
node_major="${node_major%%.*}"

echo "Local pipeline: backend CI"
echo "Node: $node_version"

if [[ "$node_major" != "24" ]]; then
  echo "Warning: GitHub Actions uses Node 24; local Node is $node_version."
fi

cd "$backend_dir"

ensure_local_binary() {
  local binary="$1"
  local binary_path="node_modules/.bin/$binary"

  if [[ ! -e "$binary_path" ]]; then
    cat >&2 <<EOF
Missing backend dependency binary: $binary

Run one of these first:
  make install
  make pipeline
  ./scripts/local-pipeline.sh

Use --skip-install only after backend dependencies have been installed successfully.
EOF
    exit 127
  fi

  if [[ ! -x "$binary_path" ]]; then
    local target_path
    target_path="$(readlink -f "$binary_path")"

    if [[ -f "$target_path" ]]; then
      echo "Fixing executable permission for $binary"
      chmod +x "$target_path"
    fi
  fi

  if [[ ! -x "$binary_path" ]]; then
    echo "Backend dependency binary is not executable: $binary_path" >&2
    exit 127
  fi
}

ensure_pipeline_binaries() {
  ensure_local_binary prettier
  ensure_local_binary eslint
  ensure_local_binary c8
}

if [[ "$skip_install" == false ]]; then
  echo
  echo "==> Installing dependencies"
  "${install_command[@]}"
else
  echo
  echo "==> Skipping dependency install"
fi

ensure_pipeline_binaries

echo
echo "==> Checking formatting"
npm run format:check

echo
echo "==> Linting"
npm run lint

echo
echo "==> Running tests with coverage"
npm run coverage:sonar

echo
echo "Local backend pipeline passed."
