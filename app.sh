#!/usr/bin/env bash
# ============================================================
# Investment Management Platform - Backend Starter Script
# ============================================================
# Usage:
#   ./app.sh           -> start backend (Spring Boot on :8080)
#   ./app.sh stop      -> stop the running backend
#   ./app.sh status    -> show whether backend is up
#   ./app.sh logs      -> tail backend log
#   ./app.sh restart   -> stop + start
#
# Frontend (separate, not handled here):
#   cd "d:\Family mart project\investment-management-client-side\investment-web"
#   npx ng serve --host 0.0.0.0 --port 4200
# ============================================================

set -e

BACKEND_DIR="d:/Family mart project/investment-management-platform"
API_DIR="$BACKEND_DIR/investment-api"
JAR="$API_DIR/target/investment-api-1.0.0-SNAPSHOT.jar"
PID_FILE="$API_DIR/.app.pid"
LOG_FILE="$API_DIR/app.log"
PORT=8080

# --- helpers ----------------------------------------------------------
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
blue()   { printf "\033[34m%s\033[0m\n" "$*"; }

is_up() {
  # returns 0 if :8080 responds 200, else 1
  curl -fsS "http://localhost:$PORT/api/ping" >/dev/null 2>&1
}

save_pid() { echo "$1" > "$PID_FILE"; }

read_pid() {
  [ -f "$PID_FILE" ] && cat "$PID_FILE" || echo ""
}

# --- commands ---------------------------------------------------------
cmd_status() {
  local pid; pid=$(read_pid)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    green "Backend RUNNING (pid=$pid, port=$PORT)"
    if is_up; then green "Health check: OK"; else yellow "Health check: process up but API not responding yet"; fi
  else
    yellow "Backend NOT running"
  fi
}

cmd_stop() {
  local pid; pid=$(read_pid)
  if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
    yellow "No backend process to stop"
    rm -f "$PID_FILE"
    return 0
  fi
  blue "Stopping backend (pid=$pid)..."
  # also kill anything else holding port :8080 (Windows: use taskkill via cmd)
  if [ -n "${WINDIR:-}" ] || [ "$OS" = "Windows_NT" ]; then
    cmd //c "taskkill /PID $pid /T /F" >/dev/null 2>&1 || true
    cmd //c "for /f \"tokens=5\" %a in ('netstat -ano ^| findstr :$PORT') do @taskkill /PID %a /F" >/dev/null 2>&1 || true
  else
    kill "$pid" 2>/dev/null || true
    sleep 2
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  green "Backend stopped"
}

cmd_logs() {
  if [ -f "$LOG_FILE" ]; then
    tail -n 200 -f "$LOG_FILE"
  else
    yellow "No log file yet at $LOG_FILE"
  fi
}

cmd_start() {
  blue "============================================================"
  blue "  Starting Investment Management Platform Backend"
  blue "============================================================"

  # 1. preflight: Java + Maven
  if ! command -v java >/dev/null 2>&1; then
    red "Java not found. Install JDK 17 and ensure 'java' is on PATH."
    exit 1
  fi
  if ! command -v mvn >/dev/null 2>&1; then
    yellow "Maven not found on PATH - will try the wrapper (mvnw) instead."
  fi

  # 2. preflight: PostgreSQL must be reachable on :5433 (db: investment_db, user: postgres/admin)
  if ! command -v psql >/dev/null 2>&1; then
    yellow "psql not installed - skipping DB connectivity check"
  else
    if PGPASSWORD=admin psql -h localhost -p 5433 -U postgres -d investment_db -c "SELECT 1" >/dev/null 2>&1; then
      green "Database reachable on :5433"
    else
      yellow "Cannot reach Postgres on :5433. Make sure it's running before starting the backend."
    fi
  fi

  # 3. if a previous run left a process, stop it first
  cmd_stop >/dev/null 2>&1 || true

  # 4. build (skip tests) - use mvnw if mvn missing
  cd "$API_DIR" || { red "Cannot cd to $API_DIR"; exit 1; }
  blue "Building backend (mvn clean package -DskipTests)..."
  if command -v mvn >/dev/null 2>&1; then
    mvn clean package -DskipTests -q
  else
    if [ -f "./mvnw" ]; then
      ./mvnw clean package -DskipTests -q
    else
      red "Neither 'mvn' nor 'mvnw' found. Install Maven or add the wrapper."
      exit 1
    fi
  fi
  green "Build complete: $JAR"

  # 5. launch in background
  blue "Launching backend..."
  : > "$LOG_FILE"
  if [ -n "${WINDIR:-}" ] || [ "$OS" = "Windows_NT" ]; then
    # Windows: use cmd /c start /B to detach
    cmd //c "start /B java -jar \"$JAR\" > \"$LOG_FILE\" 2>&1" </dev/null >/dev/null 2>&1 &
    echo $! > "$PID_FILE"
  else
    nohup java -jar "$JAR" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
  fi

  # 6. wait for /api/ping to respond (max 90s)
  blue "Waiting for backend to come up on :$PORT ..."
  for i in $(seq 1 90); do
    if is_up; then
      green "Backend is UP (pid=$(cat "$PID_FILE"))"
      blue "Health:  http://localhost:$PORT/actuator/health"
      blue "API:     http://localhost:$PORT/api/ping"
      green "Use './app.sh logs' to follow output."
      exit 0
    fi
    sleep 1
  done

  red "Backend did not start within 90s. Tail of log:"
  tail -n 80 "$LOG_FILE" || true
  exit 1
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

# --- dispatch ---------------------------------------------------------
case "${1:-start}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  status)  cmd_status ;;
  logs)    cmd_logs ;;
  restart) cmd_restart ;;
  *)
    echo "Usage: $0 {start|stop|status|logs|restart}"
    exit 2
    ;;
esac