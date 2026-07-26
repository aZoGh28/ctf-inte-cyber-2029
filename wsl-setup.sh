#!/usr/bin/env bash
set -e

echo "=== [1/4] Clone CTFd dans ~/ctfd ==="
cd "$HOME"
if [ -d "$HOME/ctfd/.git" ]; then
  echo "Deja clone, skip."
else
  rm -rf "$HOME/ctfd"
  git clone --depth 1 https://github.com/CTFd/CTFd.git "$HOME/ctfd"
fi
cd "$HOME/ctfd"

echo "=== [2/4] Creation du venv (python3.12) ==="
python3 -m venv venv
./venv/bin/python -m pip install --upgrade pip setuptools wheel >/dev/null

echo "=== [3/4] Installation des dependances (peut prendre 2-4 min) ==="
./venv/bin/python -m pip install -r requirements.txt

echo "=== [4/4] Verification import CTFd ==="
./venv/bin/python -c "import importlib; importlib.import_module('CTFd'); print('IMPORT CTFd: OK')"

echo "=== SETUP TERMINE ==="
