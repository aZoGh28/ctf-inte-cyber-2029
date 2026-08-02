#!/usr/bin/env bash
set -e
cd "$HOME/ctfd"
export FLASK_APP=CTFd
export SKIP_DB_PING=true
export WORKERS=1
# CS29 secrets runtime (flags servis par le plugin cs29map) : fichier git-ignore du repo
CS29_ENV="/mnt/c/Users/tomda/Documents/ctfd-inte/secret/ctf.env"
if [ -f "$CS29_ENV" ]; then
  set -a; . "$CS29_ENV"; set +a
  echo "[wsl-run] CS29 env charge (CS29_WEB2_FLAG defini: $([ -n "$CS29_WEB2_FLAG" ] && echo oui || echo NON))"
else
  echo "[wsl-run] ATTENTION: $CS29_ENV introuvable, les flags runtime (web2) seront des placeholders"
fi
# Ensure DB schema is current (idempotent)
./venv/bin/flask db upgrade >/dev/null 2>&1 || true
# Serve like production: gunicorn + gevent worker, reachable from Windows on localhost:8000
exec ./venv/bin/gunicorn 'CTFd:create_app()' \
  --bind 0.0.0.0:8000 \
  --workers 1 \
  --worker-class gevent \
  --access-logfile - \
  --error-logfile -
