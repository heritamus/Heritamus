#!/usr/bin/env bash

# Nginx config and restart
sudo rm -f /etc/nginx/conf.d/heritamus.conf
sudo cp nginx/heritamus.conf /etc/nginx/conf.d/
sudo systemctl restart nginx

# Build app
npm run build:prod

# Service config and start
sudo rm -f /lib/systemd/system/heritamus.service
sudo cp systemd/heritamus.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start heritamus.service
sudo systemctl enable heritamus.service
sudo systemctl status heritamus.service