# Deployment Guide

## Prerequisites
- Docker installed
- Access to a production database

## Steps
1. Build the Docker image:
   ```bash
   docker build -t project-name .
   ```
2. Run the container:
   ```bash
   docker run -d -p 80:80 project-name
   ```
