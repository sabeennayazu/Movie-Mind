#!/bin/bash

# Activate the virtual environment
source venv/bin/activate

# Start Django server on port 8001
echo "Starting Django server on port 8001..."
python manage.py runserver 8001
