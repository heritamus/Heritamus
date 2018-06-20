#!/usr/bin/env bash

# Build app
npm run build:prod

# Restart service
sudo systemctl restart heritamus.service
sudo systemctl status heritamus.service
