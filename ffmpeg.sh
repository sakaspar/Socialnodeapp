#!/bin/bash run this first : ! chmod +x filename.sh

# Update the package index
sudo apt-get update

# Install ffmpeg
sudo apt-get install ffmpeg

# Verify the installation
ffmpeg -version