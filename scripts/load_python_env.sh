#!/bin/sh

echo 'Creating Python virtual environment "app/backend/.venv"...'
python3 -m venv app/backend/.venv

echo 'Installing dependencies from "requirements.txt" into virtual environment (in quiet mode)...'
app/backend/.venv/bin/python -m pip --quiet --disable-pip-version-check install -r app/backend/requirements.txt