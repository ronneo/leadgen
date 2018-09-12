#!/bin/sh

export $(cat .env | xargs)
if [ -f .redis.env ]; then
  ./tools/redis_local.sh
  export $(cat .redis.env | xargs)
fi
NODE_ENV=dev NODE_PATH=. babel-node ./server/localtunnel.js &
sleep 2 # sleep 2s for localtunnel servie up
NODE_ENV=dev NODE_PATH=. nodemon ./server/server.js --watch ./server --exec babel-node
