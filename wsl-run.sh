#!/usr/bin/env bash
set -e
cd "$HOME/ctfd"
export FLASK_APP=CTFd
export SKIP_DB_PING=true
export WORKERS=1
# Ensure DB schema is current (idempotent)
./venv/bin/flask db upgrade >/dev/null 2>&1 || true
# Serve like production: gunicorn + gevent worker, reachable from Windows on localhost:8000
exec ./venv/bin/gunicorn 'CTFd:create_app()' \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --worker-class gevent \
  --access-logfile - \
  --error-logfile -
