#!/bin/bash
set -e

echo "── Building client ──"
cd client
npm install
npm run build
cd ..

echo "── Copying to Apache ──"
sudo rm -rf /var/www/hojco/*
sudo cp -r client/dist/* /var/www/hojco/
sudo cp .htaccess /var/www/hojco/.htaccess

echo "── Restarting server ──"
cd server
npm install
pm2 restart hojco-server || pm2 start server.js --name hojco-server
cd ..

echo "── Done. Site is live. ──"