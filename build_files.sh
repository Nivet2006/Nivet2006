#!/bin/bash
set -e

echo "Installing dependencies..."
python3 -m pip install -r requirements.txt

echo "Collecting static files..."
python3 manage.py collectstatic --noinput --clear

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  python3 manage.py migrate --noinput
fi

echo "Build completed successfully."
