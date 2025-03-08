#!/bin/sh

echo 'Creating Python virtual environment and installing dependencies...'
sh scripts/load_python_env.sh

echo ""
echo "Restoring frontend npm packages"
echo ""
cd app/frontend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to restore frontend npm packages"
    exit $?
fi

echo ""
echo "Building frontend"
echo ""
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build frontend"
    exit $?
fi

echo ""
echo "Starting backend"
echo ""
cd ../../
app/backend/.venv/bin/python app/backend/app.py
if [ $? -ne 0 ]; then
    echo "Failed to start backend"
    exit $?
fi