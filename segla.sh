#!/bin/sh
# Enable debugging output
# set -x

# Change to the finance-app directory
cd ~/finance-app/

# Start Docker containers in detached mode
docker-compose up -d

# Wait for the Docker container to be up (you can adjust the timeout)
echo "Waiting for Docker container to be ready..."
while ! docker-compose exec frontend sh -c 'echo "Container is ready"'; do
  sleep 2
done

# Wait for additional time
echo "Waiting for the application to fully initialize..."
sleep 3

# Open the web page in the default web browser
cmd.exe /C start http://localhost:3000

# Prompt the user to finish using the application
echo ""
echo "Finished using the application? Press any key to perform application shutdown"
echo "(recommended, as otherwise, it consumes resources unnecessarily)."
echo "Press any key to continue..."
read input
echo ""

# Perform cleanup (e.g., stop Docker containers and quit Docker Desktop)
echo "Performing cleanup..."
docker-compose down

# Quit Docker Desktop if it was started by this script
if tasklist | findstr /i "Docker Desktop.exe" > /dev/null; then
  echo "Quitting Docker Desktop..."
  cmd.exe /C taskkill /F /IM "Docker Desktop.exe"
fi
